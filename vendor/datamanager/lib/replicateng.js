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
            $.log('_rep', rep);
            var repData = rep.doc;
            if (repData._replication_id in activeTasks) {
                $.extend(repData, activeTasks[repData._replication_id]); // merge objects
            }
            compiledData.push(repData);
        }
        onSuccess(compiledData);
    };

    // get active tasks (to get progress percentage)
    $.couch.activeTasks({
        success: function(data) {
            var doc;
            $.log('at got', data);
            if (data && data.length) {
                for (var i=0, l=data.length; i<l; i++) {
                    doc = data[i];
                    if (doc.type != 'replication') {
                        continue;
                    }
                    $.log('adding activeTasks doc', doc);
                    activeTasks[doc.replication_id] = doc;
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
            $.log('replicator info', data.rows);
            replications = data.rows;
            compileData();
        },
        error: function(data) {
            onError('Could not get _replicator info');
        }
    });
};

// Pushes a new replication into the "_replicator" database
exports.Replicator.prototype.replicate = function(source, target, continuous, ids, filter, onSuccess, onError) {
    // débrouille-toi :)
    $.log('IN REPLICATE', source, target, continuous);
    $.log('ids', ids);
    $.log('filter', filter);

    var repDoc = {
        source: source,
        target: target,
        continuous: continuous
    };

    // ids list?
    if (ids) {
        repDoc.doc_ids = ids;
    }

    // filter to apply?
    if (filter) {
        repDoc.filter = filter;
    }

    this.db.saveDoc(repDoc, {
        success: function(data) {
            $.log('replication created', data);
            onSuccess(data);
        },
        error: function(data) {
            $.log('replication foirax', data);
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
exports.Replicator.prototype.launchFromWizard = function(db, data, onSuccess, onError) {

    var zis = this;

    // normalize db name if needed
    var database = data.database;
    if (database.substr(0, 8) == 'local://') {
        database = database.slice(8);
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
        this.replicate(source, target, data.continuous, null, null, onSuccess, onError);
        return true;
    }

    // execute querie(s) and replicate returned ids only (always PUSH)
    if (data.what.mode == 'queries') {
        getIdsFromQueries(db, data.what.queries, function(ids) {
            zis.replicate(source, target, data.continuous, ids, null, onSuccess, onError);
        }, onError);
        return true;
    }

    // replicate ids contained in given selections only
    if (data.what.mode == 'selections') {
        var remoteDb = null;
        if (data.direction == 'get') {
            remoteDb = data.database;
        }
        getIdsFromSelections(db, remoteDb, data.what.selections, function(ids) {
            zis.replicate(source, target, data.continuous, ids, null, onSuccess, onError);
        }, onError);
        return true;
    }

    // replicate based on structures - may need to use a filter
    if (data.what.mode == 'advanced') {
        computeAdvancedReplication(db, data, function(ids, filter) {
            zis.replicate(source, target, data.continuous, ids, filter, onSuccess, onError);
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
function getIdsFromSelections(db, remoteDb, selections, onSuccess, onError) {

    var selection,
        ids = [],
        tasks = selections.length,
        localServer = (remoteDb && (remoteDb.substr(0, 8) == 'local://')),
        dbToOpen = db;

    if (remoteDb != null) { // GET data
        if (localServer) {
            dbToOpen = $.couch.db(remoteDb.slice(8));
        }
    }

    for (var i=0, l=selections.length; i<l; i++) {
        selection = selections[i];
        if ((remoteDb != null) && (! localServer)) { // use a service to get selections contents from remote server
            // @TODO call webservice
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
function computeAdvancedReplication(db, data, onSuccess, onError) {

    var structures = data.what.structures,
        tasks = 0,
        localServer = (data.database.substr(0, 8) == 'local://'),
        dbToOpen = db,
        ids = null;

    if (data.direction == 'get') {
        if (localServer) {
            dbToOpen = $.couch.db(data.database.slice(8));
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
    tasks = tasks * 2; // 2 calls for each vqd requests
    tasks++; // one for structures definitions

    var struct;
    if (useIds) { // get list of ids for structures and/or views and queries definitions
        ids = [];
        var mmId;
        for (var i=0, l=structures.length; i<l; i++) {
            struct = structures[i];
            if (struct.structure) {
                ids.push(struct.id);
            }
            if (struct.vqd) {
                if ((data.direction == 'get') && (! localServer)) { // use service to get views and queries ids from remote server
                    // @TODO call webservice
                } else {
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
    } else {
        var filter = {};
        // @TODO build filter
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