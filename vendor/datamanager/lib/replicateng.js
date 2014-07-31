/* lib replicate new generation */
var utilsLib = require('vendor/datamanager/lib/utils'),
    queryLib = require('vendor/datamanager/lib/query');

// Abstraction for the _replicator database and mechanisms
exports.Replicator = function(replicatorDbName) {

    if (!replicatorDbName) {
        replicatorDbName = '_replicator';
    }
    //replicatorDbName = '_replicate'; // DEBUG
    this.db = $.couch.db(replicatorDbName);
};

// Gets all defined replications by reading the "_replicator" database and the
// "_active_tasks" stream
// if "dbname" is specified, only replications concerning this db will be returned
exports.Replicator.prototype.getAllReplications = function(activedb, onSuccess, onError, dbname) {

    var tasks = 2,
        activeTasks = {},
        replications = [];

    var compileData = function() {
        tasks --;
        if (tasks > 0) {
            return false;
        }
        // compile replication characteristics and replication progress into one dataset
        var compiledData = [],
            rep;
        for (var i=0; i < replications.length; i++) {
            rep = replications[i];
            if (! dbname || (rep.doc.source == dbname || rep.doc.target == dbname)) {
                if (rep.id == '_design/_replicator') {
                    continue;
                }
                var repData = rep.doc;
                if (repData._id in activeTasks) {
                    $.extend(repData, activeTasks[repData._id]); // merge objects
                }
                compiledData.push(repData);
            }
        }
        onSuccess(compiledData);
    };

    var processActiveTasks = function(data) {
        var doc;
        if (data && data.length) {
            for (var i=0, l=data.length; i<l; i++) {
                doc = data[i];
                if (doc.type != 'replication') {
                    continue;
                }
                activeTasks[doc.doc_id] = doc;
            }
        }
        compileData();
    };
    
    var processReplicatorData = function(data) {
        replications = data.rows;
        compileData();
    };

    // get active tasks (to get progress percentage)
    $.couch.activeTasks({
        success: processActiveTasks,
        error: function() {
            activedb.dm_admin(activedb.name, 'active_tasks', {}, null, processActiveTasks, function(err) {
                //$.log(err);
                onError('Could not get activeTasks info'); 
            });
        }
    });
    // get info from _replicator database
    this.db.allDocs({
        include_docs: true,
        success: processReplicatorData,
        error: function() {
            activedb.dm_admin(activedb.name, 'replicator_docs', {}, null, processReplicatorData, function(err) {
                //$.log(err);
                onError('Could not get _replicator info');
            });
        }
    });
};

// Pushes a new replication into the "_replicator" database
exports.Replicator.prototype.replicate = function(source, target, continuous, ids, filterParams, userCtx, onSuccess, onError, extraData) {

    //$.log('ids', ids);
    //$.log('filter', filterParams);

    var repDoc = {
        source: source,
        target: target,
        continuous: continuous,
        user_ctx: userCtx,
        extra: extraData // store synchronization parameters to show details / restart it
    };

    // ignore checkpointed source sequence and restart sync from zero?
    if (extraData && extraData.restartFromSeq !== undefined) {
        repDoc.since_seq = extraData.restartFromSeq;
    }

    // ids list?
    if (ids) {
        repDoc.doc_ids = ids;
    }

    // filter to apply?
    if (filterParams) {
        repDoc.filter = 'datamanager/replication';
        //repDoc.filter = 'in_erlang/replication';
        repDoc.query_params = filterParams;
    }

    this.db.saveDoc(repDoc, {
        success: onSuccess,
        error: onError
    });
};

// Cancel a running replication, given its id
exports.Replicator.prototype.cancelReplication = function(id, onSuccess, onError) {
    var that = this;
    this.db.openDoc(id, {
        success: function(doc) {
            that.db.removeDoc(doc, {
                success: onSuccess,
                error: onError
            });
        },
        error: onError
    });
};

// Cancels all replications concerning the given db (in a way or another)
exports.Replicator.prototype.cancelAllReplicationsForDb = function(db, onSuccess, onError) {

    var tasks = 1,
        zis = this;

    this.getAllReplications(db, function(data) {
        tasks += data.length;
        for (var i=0; i < data.length; i++) {
            zis.cancelReplication(data[i]._id, next, next);
        }
        next();
    }, onSuccess, db.name);

    function next() {
        tasks--;
        if (tasks == 0) {
            onSuccess();
        }
    }
};

// Restart a completed / failed replication, given its id
// deleting "_replication_state" and saving the doc should be enough, but pas confiance
exports.Replicator.prototype.restartReplication = function(db, id, onSuccess, onError, restartFromZero) {
    var that = this;
    this.db.openDoc(id, {
        success: function(doc) {
            var userCtx = doc.user_ctx,
                wizardData = doc.extra;
            if (restartFromZero === true) {
                wizardData.restartFromSeq = 0;
            }
            //$.log('docopen', doc);
            that.launchFromWizard(db, wizardData, userCtx, function() {
                that.db.removeDoc(doc, {
                    success: onSuccess,
                    error: onError
                });
            }, onError);
        },
        error: onError
    });
};

// Prepares and launches a replication based on the information collected by the
// "new replication" wizard. Executes queries and/or uses filters if needed.
exports.Replicator.prototype.launchFromWizard = function(db, data, userCtx, onSuccess, onError) {

    var zis = this,
        isRemote = false,
        sourceIsRemote = false;

    // normalize db name if needed
    var database = data.database;
    if (database.host == 'local') {
        database = database.dbname;
    } else {
        database = 'http://' + data.login + ':' + data.password + '@' + database.host.slice(7) + ':' + database.port + '/' + database.dbname;
        isRemote = true;
    }

    // Is the data source on a distant server? Needed for an eventual filter
    if ((data.direction == 'get') && isRemote) {
        sourceIsRemote = true;
    }

    var source,
        target;
    if (data.direction == 'get') {
        source = database;
        target = db.name;
    } else {
        source = db.name;
        target = database;
    }

    // replicate everything
    if (data.what.mode == 'all') {
        this.replicate(source, target, data.continuous, null, null, userCtx, onSuccess, onError, data);
        return true;
    }

    var remoteDb = null;
    if (data.direction == 'get') {
        remoteDb = data.database;
    }

    // execute querie(s) and replicate returned ids only
    if (data.what.mode == 'queries') {
        getIdsFromQueries(db, remoteDb, data, function(ids) {
            zis.replicate(source, target, data.continuous, ids, null, userCtx, onSuccess, onError, data);
        }, onError);
        return true;
    }

    // replicate ids contained in given selections only
    if (data.what.mode == 'selections') {
        getIdsFromSelections(db, remoteDb, data, function(ids) {
            zis.replicate(source, target, data.continuous, ids, null, userCtx, onSuccess, onError, data);
        }, onError);
        return true;
    }

    // replicate based on structures - may need to use a filter
    if (data.what.mode == 'advanced') {
        computeAdvancedReplication(db, remoteDb, data, sourceIsRemote, function(ids, filter) {
            zis.replicate(source, target, data.continuous, ids, filter, userCtx, onSuccess, onError, data);
        }, onError);
    }
};

// returns the (unique'd) union of the ids returned by all the given queries
function getIdsFromQueries(db, remoteDb, data, onSuccess, onError) {

    var queries = data.what.queries,
        query,
        ids = [],
        tasks = queries.length,
        localServer = (remoteDb && (remoteDb.host == 'local')),
        dbToOpen = db;

    if (remoteDb != null) { // GET data
        if (localServer) {
            dbToOpen = $.couch.db(remoteDb.dbname);
        }
    }

    for (var i = 0, l = queries.length; i<l; i++) {
        query = queries[i];
        // include query doc's id ?
        //ids = ids.concat(query.id);
        if ((remoteDb != null) && (! localServer)) {
            // use service to execute query from remote server
            db.dm_admin(db.name, 'call_remote', {}, {
                host: remoteDb.host.slice(7), // remove http://
                port: remoteDb.port,
                db: remoteDb.dbname,
                username: data.login,
                password: data.password,
                remoteAction: 'execute_query',
                params: JSON.stringify({ id: query.id })
            }, function(resp) {
                ids = ids.concat(resp.data.ids);
                next();
            }, function(error) {
                next();
            });
        } else {
            dbToOpen.openDoc(query.id, {
                success: function(doc) {
                    queryLib.query(dbToOpen, doc, function(qids) {
                        ids = ids.concat(qids);
                        next();
                    }, function() {
                        onError('cannot execute query');
                    });
                },
                error: function(err) {
                    onError('cannot open query doc');
                }
            });
        }
    }

    function next() {
        tasks--;
        if (tasks == 0) {
            ids = ids.unique();
            onSuccess(ids);
        }
    }
}

// returns the (unique'd) union of the ids contained in all the given selections;
// ask remote database for selections contents if needed
function getIdsFromSelections(db, remoteDb, data, onSuccess, onError) {

    var selections = data.what.selections,
        selection,
        ids = [],
        tasks = selections.length,
        localServer = (remoteDb && (remoteDb.host == 'local')),
        dbToOpen = db;

    if (remoteDb != null) { // GET data
        if (localServer) {
            dbToOpen = $.couch.db(remoteDb.dbname);
        }
    }

    for (var i = 0, l = selections.length; i<l; i++) {
        selection = selections[i];
        // include selection doc's id
        ids = ids.concat(selection.id);
        if ((remoteDb != null) && (! localServer)) {
            // use a service to get selections contents from remote server
            db.dm_admin(db.name, 'call_remote', {}, {
                host: remoteDb.host.slice(7), // remove http://
                port: remoteDb.port,
                db: remoteDb.dbname,
                username: data.login,
                password: data.password,
                remoteAction: 'get_selection_contents',
                params: JSON.stringify({ id: selection.id })
            }, function(resp) {
                ids = ids.concat(resp.data.ids);
                next();
            }, function(error) {
                next();
            });
        } else { // selections are on the local server
            dbToOpen.openDoc(selection.id, {
                success: function(doc) {
                    ids = ids.concat(doc.ids);
                    next();
                },
                error: function(err) {
                    onError('cannot open selection doc');
                }
            });
        }
    }

    function next() {
        tasks--;
        if (tasks == 0) {
            ids = ids.unique();
            onSuccess(ids);
        }
    }
}

// try to make the best choice for advanced by-structure replication: use an ids
// list or a filter
function computeAdvancedReplication(db, remoteDb, data, sourceIsRemote, onSuccess, onError) {

    var structures = data.what.structures,
        includeDeleted = data.includedeleted,
        tasks = 0,
        localServer = (remoteDb && (remoteDb.host == 'local')),
        dbToOpen = db,
        ids = null;

    if (remoteDb != null) { // GET data
        if (localServer) {
            dbToOpen = $.couch.db(remoteDb.dbname);
        }
    }

    var useIds = true;
    // use ids only if no "data" has to be replicated
    for (var i=0, l=structures.length; i<l; i++) {
        if (structures[i].data) {
            useIds = false;
        }
        if (structures[i].vqd) {
            tasks++;
        }
    }
    tasks++; // one for structures definitions

    var struct;
    if (useIds) { // get list of ids for structures and/or views and queries definitions
        ids = [];
        for (var i=0, l=structures.length; i<l; i++) {
            struct = structures[i];
            if (struct.structure) {
                ids.push(struct.id);
            }
            if (struct.vqd) {
                if ((remoteDb != null) && (! localServer)) {
                    // use service to get views and queries ids from remote server
                    db.dm_admin(db.name, 'call_remote', {}, {
                        host: remoteDb.host.slice(7), // remove http://
                        port: remoteDb.port,
                        db: remoteDb.dbname,
                        username: data.login,
                        password: data.password,
                        remoteAction: 'get_views_queries',
                        params: JSON.stringify({ id: struct.id })
                    }, function(resp) {
                        resp.data.rows.forEach(function(e) {
                            ids.push(e.id);
                        });
                        next();
                    }, function(error) {
                        next();
                    });
                } else {
                    tasks++; // 2 calls for each vqd requests
                    dbToOpen.view('datamanager/views_queries', {
                        startkey: ['v', struct.id],
                        endkey: ['v', struct.id, {}],
                        success: function(vdata) {
                            vdata.rows.map(function(row) {
                                ids.push(row.id);
                            });
                            next();
                        },
                        error: function() {
                            onError('Cannot open view "views_queries" (v)');
                        }
                    });
                    dbToOpen.view('datamanager/views_queries', {
                        startkey: ['q', struct.id],
                        endkey: ['q', struct.id, {}],
                        success: function(qdata) {
                            qdata.rows.map(function(row) {
                                ids.push(row.id);
                            });
                            next();
                        },
                        error: function() {
                            onError('Cannot open view "views_queries" (q)');
                        }
                    });
                }
            }
        }
        next();
    } else { // build parameters for the "replication" filter
        var filter = {
            ids: {},
            structures: {},
            types: {},
        };

        for (var i=0, l=structures.length; i<l; i++) {
            struct = structures[i];
            if (struct.structure) {
                filter.ids[struct.id] = true;
            }
            if (struct.data) {
                filter.structures[struct.id] = {
                    data: true
                };
            }
            if (struct.vqd) {
                filter.structures[struct.id] = filter.structures[struct.id] || {};
                filter.structures[struct.id].view = true;
                filter.structures[struct.id].query = true;
            }
        }

        // optimize filter
        if (utilsLib.objectEmpty(filter.ids)) {
            delete filter.ids;
        }
        if (utilsLib.objectEmpty(filter.structures)) {
            delete filter.structures;
        }
        if (utilsLib.objectEmpty(filter.types)) {
            delete filter.types;
        }

        // if the data source is on a remote server, tell the filter to parse the
        // parameters it will receive and hack couchdb erlangification of object params
        if (sourceIsRemote) {
            var singleParam = {};
            if (! utilsLib.objectEmpty(filter.ids)) {
                singleParam.ids = filter.ids;
                delete filter.ids;
            }
            if (! utilsLib.objectEmpty(filter.structures)) {
                singleParam.structures = filter.structures;
                delete filter.structures;
            }
            if (! utilsLib.objectEmpty(filter.types)) {
                singleParam.types = filter.types;
                delete filter.types;
            }
            filter.singleParam = JSON.stringify(singleParam);
            filter.parse = 'true'; // param values must be strings, at least in _replicate (may cause a problem in _replicator too ?)
        }
        // include deleted docs in replication?
        filter.includedeleted = (includeDeleted ? 'true' : 'false');

        onSuccess(null, filter);
    }

    function next() {
        tasks--;
        if (tasks == 0) {
            ids = ids.unique();
            onSuccess(ids, null);
        }
    }
}