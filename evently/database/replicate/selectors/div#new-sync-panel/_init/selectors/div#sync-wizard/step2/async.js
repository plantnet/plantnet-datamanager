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
        structures = [];

    //$.log('step1data', data);

    if (isPut) {
        tasks = 2;
        // get local structures list
        structures = cacheLib.get_cached_mms(app);
        structures.sort(function(a, b) {
            if (a.isref && ! b.isref) {
                return -1;
            } else if (! a.isref && b.isref) {
                return 1;
            } else {
                return (a.name.toLowerCase() > b.name.toLowerCase()) ? 1 : -1;
            }
        });
        // get local queries list
        db.view('datamanager/views_queries', {
            startkey: ['q'],
            endkey: ['q', {}],
            success: function(d) {
                queries = d.rows;
                for (var i=0; i < queries.length; i++) {
                    queries[i].structureName = cacheLib.get_cached_mm(app, queries[i].key[1]).name;
                }
                queries.sort(function(a, b) {
                    if (a.structureName.toLowerCase() > b.structureName.toLowerCase()) {
                        return 1;
                    } else if (a.structureName.toLowerCase() < b.structureName.toLowerCase()) {
                        return -1;
                    } else {
                        return (a.value.name.toLowerCase() > b.value.name.toLowerCase()) ? 1 : -1;
                    }
                });
                next();
            },
            error: function(err) {
                utilsLib.showError('Error while retrieving local queries list');
                next();
            }
        });
        // get local selections list
        db.view('datamanager/selections', {
            success: function(d) {
                selections = d.rows;
                selections.sort(function(a, b) {
                    return (a.key.toLowerCase() > b.key.toLowerCase()) ? 1 : -1;
                });
                next();
            },
            error: function(err) {
                utilsLib.showError('Error while retrieving local selections list');
                next();
            }
        });
    } else {
        tasks = 2;
        // get structures list from remote database using Node action
        // get selections list from remote database using Node action
        next();
        next();
    }

    function next() {
        tasks--;
        if (tasks == 0) {
            data.available = {
                queries: queries,
                selections: selections,
                structures: structures
            };
            callback(data);
        }
    }
}