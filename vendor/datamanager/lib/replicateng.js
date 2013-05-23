/* lib replicate new generation */
var utilsLib = require('vendor/datamanager/lib/utils'),
    queryLib = require('vendor/datamanager/lib/query');

// Abstraction for the _replicator database and mechanisms
exports.Replicator = function(replicatorDbName) {

    if (! replicatorDbName) {
        replicatorDbName = '_replicator';
    }
    this.db = $.couch.db(replicatorDbName);
};

// Gets all defined replications by reading the "_replicator" database and the
// "_active_tasks" stream
exports.Replicator.prototype.getAllReplications = function(onSuccess, onError) {

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
            if (rep.id == '_design/_replicator') {
                continue;
            }
            //$.log('_rep', rep);
            var repData = rep.doc;
            if (repData._id in activeTasks) {
                $.extend(repData, activeTasks[repData._id]); // merge objects
            }
            compiledData.push(repData);
        }
        onSuccess(compiledData);
    };

    // get active tasks (to get progress percentage)
    $.couch.activeTasks({
        success: function(data) {
            var doc;
            //$.log('at got', data);
            if (data && data.length) {
                for (var i=0, l=data.length; i<l; i++) {
                    doc = data[i];
                    if (doc.type != 'replication') {
                        continue;
                    }
                    //$.log('adding activeTasks doc', doc);
                    activeTasks[doc.doc_id] = doc;
                }
            }
            compileData();
        },
        error: function(err) {
            onError('Could not get activeTasks info');
        }
    });
    // get info from _replicator database
    this.db.allDocs({
        include_docs: true,
        success: function(data) {
            //$.log('replicator info', data.rows);
            replications = data.rows;
            compileData();
        },
        error: function(data) {
            onError('Could not get _replicator info');
        }
    });
};

// Pushes a new replication into the "_replicator" database
exports.Replicator.prototype.replicate = function(source, target, continuous, ids, filterParams, userCtx, onSuccess, onError) {
    // débrouille-toi :)
    $.log('ids', ids);
    $.log('filter', filterParams);

    var repDoc = {
        source: source,
        target: target,
        continuous: continuous,
        user_ctx: userCtx
    };

    // ids list?
    if (ids) {
        repDoc.doc_ids = ids;
    }

    // filter to apply?
    if (filterParams) {
        repDoc.filter = 'datamanager/replication';
        repDoc.query_params = filterParams;
    }

    this.db.saveDoc(repDoc, {
        success: function(data) {
            //$.log('replication created', data);
            onSuccess(data);
        },
        error: function(data) {
            //$.log('replication foirax', data);
            onError(data);
        }
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

// Prepares and launches a replication based on the information collected by the
// "new replication" wizard. Executes queries and/or uses filters if needed.
exports.Replicator.prototype.launchFromWizard = function(db, data, userCtx, onSuccess, onError) {

    var zis = this;

    // normalize db name if needed
    var database = data.database;
    if (database.host == 'local') {
        database = database.dbname;
    } else {
        database = 'http://' + data.login + ':' + data.password + '@' + database.host.slice(7) + ':' + database.port + '/' + database.dbname;
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
        this.replicate(source, target, data.continuous, null, null, userCtx, onSuccess, onError);
        return true;
    }

    // execute querie(s) and replicate returned ids only (always PUSH)
    if (data.what.mode == 'queries') {
        getIdsFromQueries(db, data.what.queries, function(ids) {
            zis.replicate(source, target, data.continuous, ids, null, userCtx, onSuccess, onError);
        }, onError);
        return true;
    }

    var remoteDb = null;
    if (data.direction == 'get') {
        remoteDb = data.database;
    }

    // replicate ids contained in given selections only
    if (data.what.mode == 'selections') {
        getIdsFromSelections(db, remoteDb, data, function(ids) {
            zis.replicate(source, target, data.continuous, ids, null, userCtx, onSuccess, onError);
        }, onError);
        return true;
    }

    // replicate based on structures - may need to use a filter
    if (data.what.mode == 'advanced') {
        computeAdvancedReplication(db, remoteDb, data, function(ids, filter) {
            zis.replicate(source, target, data.continuous, ids, filter, userCtx, onSuccess, onError);
        }, onError);
    }
};

// returns the (unique'd) union of the ids returned by all the given queries
function getIdsFromQueries(db, queries, onSuccess, onError) {

    var query,
        ids = [],
        tasks = queries.length;

    for (var i=0, l=queries.length; i<l; i++) {
        query = queries[i];
        db.openDoc(query.id, {
            success: function(doc) {
                queryLib.query(db, doc, function(qids) {
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

    for (var i=0, l=selections.length; i<l; i++) {
        selection = selections[i];
        if ((remoteDb != null) && (! localServer)) {
            // use a service to get selections contents from remote server
            utilsLib.admin_db(db, 'call_remote', {}, {
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
function computeAdvancedReplication(db, remoteDb, data, onSuccess, onError) {

    var structures = data.what.structures,
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
                    utilsLib.admin_db(db, 'call_remote', {}, {
                        host: remoteDb.host.slice(7), // remove http://
                        port: remoteDb.port,
                        db: remoteDb.dbname,
                        username: data.login,
                        password: data.password,
                        remoteAction: 'get_views_queries',
                        params: JSON.stringify({ id: struct.id })
                    }, function(resp) {
                        ids = ids.concat(resp.data.ids);
                        next();
                    }, function(error) {
                        next();
                    });
                } else {
                    tasks = (tasks * 2) - 1; // 2 calls for each vqd requests
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
            types: {}
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

        if (utilsLib.objectEmpty(filter.ids)) filter.ids = null;
        if (utilsLib.objectEmpty(filter.structures)) filter.structures = null;
        if (utilsLib.objectEmpty(filter.types)) filter.types = null;

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