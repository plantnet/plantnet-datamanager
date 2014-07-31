function(callback, e, data) {
    // gets structures list, queries list (if "put" mode) and selections list for selected db
    var app = $$(this).app,
        db = app.db,
        utilsLib = app.getlib('utils'),
        cacheLib = app.getlib('cache'),
        isPut = (data.direction == 'put'),
        tasks,
        queries = [],
        selections = [],
        structures = [],
        dbToOpen = db,
        remoteDb = data.database,
        isLocal = false;

    // 
    if ((! isPut) && (remoteDb.host == 'local')) {
        isLocal = true;
        dbToOpen = $.couch.db(remoteDb.dbname);
    }

    if (isPut || isLocal) { // database is on the same server
        tasks = 3;
        // get local structures list
        if (isPut) {
            structures = cacheLib.get_cached_mms(app);
            getNbDocs(structures, db, next);
        } else { // if isLocal
            dbToOpen.allDocs({
                startkey: '_design/mm_',
                endkey: '_design/mm_\ufff0',
                include_docs: true,
                success: function(data) {
                    data.rows.map(function(e) {
                        structures.push(e.doc);
                    });
                    getNbDocs(structures, dbToOpen, next);
                },
                error: function(err) {
                    utilsLib.showError('Error while retrieving database structures');
                    next();
                }
            });
        }
        // get local queries list
        dbToOpen.view('datamanager/views_queries', {
            startkey: ['q'],
            endkey: ['q', {}],
            success: function(d) {
                queries = d.rows;
                for (var i=0; i < queries.length; i++) {
                    var cachedMm = cacheLib.get_cached_mm(app, queries[i].key[1]);
                    if (cachedMm) {
                        queries[i].structureName = cachedMm.name;
                    } else { // may occur if a query doc was replicated but not the corresponding structure design doc
                        queries[i].structureName = '? (unknown structure)';
                    }
                }
                next();
            },
            error: function(err) {
                utilsLib.showError('Error while retrieving local queries list');
                next();
            }
        });
        // get local selections list
        dbToOpen.view('datamanager/selections', {
            success: function(d) {
                selections = d.rows;
                next();
            },
            error: function(err) {
                utilsLib.showError('Error while retrieving local selections list');
                next();
            }
        });
    } else { // get from database on another server
        //$.log('data', data);
        tasks = 3;
        // get structures list from remote database
        db.dm_admin(db.name, 'call_remote', {}, {
            host: data.database.host.slice(7), // remove http://
            port: data.database.port,
            db: data.database.dbname,
            username: data.login,
            password: data.password,
            remoteAction: 'get_structures'
        }, function(data) {
            structures = data.data;
            next();
        }, function(error) {
            next();
        });
        // get selections list from remote database
        db.dm_admin(db.name, 'call_remote', {}, {
            host: data.database.host.slice(7), // remove http://
            port: data.database.port,
            db: data.database.dbname,
            username: data.login,
            password: data.password,
            remoteAction: 'get_selections'
        }, function(data) {
            selections = data.data;
            next();
        }, function(error) {
            next();
        });
        // get queries list from remote database
        db.dm_admin(db.name, 'call_remote', {}, {
            host: data.database.host.slice(7), // remove http://
            port: data.database.port,
            db: data.database.dbname,
            username: data.login,
            password: data.password,
            remoteAction: 'get_views_queries'
        }, function(resp) {
            if (resp.data.rows) {
                queries = resp.data.rows;
            }
            queries.filter(function(e) {
                e.structureName = '? (unknown structure)';
                return (e.key[0] == 'q');
            });
            next();
        }, function(error) {
            next();
        });
    }

    function next() {
        tasks--;
        if (tasks == 0) {
            // sort everything
            if (structures && structures.sort) {
                structures.sort(function(a, b) {
                    if (a.isref && ! b.isref) {
                        return -1;
                    } else if (! a.isref && b.isref) {
                        return 1;
                    } else {
                        return (a.name.toLowerCase() > b.name.toLowerCase()) ? 1 : -1;
                    }
                });
            } else {
                structures = []; // if call_remote returned bad stuff
            }
            if (queries && queries.sort) {
                queries.sort(function(a, b) {
                    if (a.structureName.toLowerCase() > b.structureName.toLowerCase()) {
                        return 1;
                    } else if (a.structureName.toLowerCase() < b.structureName.toLowerCase()) {
                        return -1;
                    } else {
                        return (a.value.name.toLowerCase() > b.value.name.toLowerCase()) ? 1 : -1;
                    }
                });
            } else {
                queries = [];
            }
            if (selections && selections.sort) {
                selections.sort(function(a, b) {
                    return (a.key.toLowerCase() > b.key.toLowerCase()) ? 1 : -1;
                });
            } else {
                selections = [];
            }
            // send result
            data.available = {
                queries: queries,
                selections: selections,
                structures: structures
            };
            callback(data);
        }
    }

    function getNbDocs(structures, db, callback) {
        if (! structures) {
            callback();
            return;
        }
        var nbTasks = structures.length;
        for (var i = 0; i < structures.length; i++) {
            db.view('datamanager/by_mm', {
                key: structures[i]._id,
                success: function(j) {
                    return function(count) {
                        if (count.rows.length) {
                            structures[j].nbDocs = count.rows[0].value;
                        } else {
                            structures[j].nbDocs = 0;
                        }
                        nbTasks--;
                        if (nbTasks == 0) {
                            callback();
                        }
                    };
                }(i),
                error: function(j) {
                    return function(err) {
                        structures[j].nbDocs = '-';
                        nbTasks--;
                        if (nbTasks == 0) {
                            callback();
                        }
                    };
                }(i)
            });
        }
    }
}