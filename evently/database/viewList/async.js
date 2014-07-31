function(callback, e, params) {
    var id = params.id,
        action = params.action,
        skip = params.skip,
        label = decodeURIComponent(params.label),
        show_images = (params.show_images === 'true'),
        app = $$(this).app,
        utilsLib = app.getlib('utils'),
        limit = app.config.page_size,
        db = app.db;

    skip = skip ? parseInt(skip) : 0;

    var process_action = {
        _open_ids: function(ids, title, isQuery) {
            // open docs
            //$.log('process ids', ids.length, ids);
            db.allDocs({
                keys: ids.slice(skip, skip+limit),
                include_docs: true,
                conflicts: true,
                success: function(docs) {
                    callback(title, isQuery, action, id, docs, skip, limit, ids.length, docs.rows.length, show_images);
                }});
        },
        select: function() {
            db.openDoc(id, {
                success: function(sdoc) {
                    process_action._open_ids(sdoc.ids, 'Selection ' + sdoc.name);
                }, 
                error: function() {
                    process_action._open_ids([], "Selection does not exist");
                }
            });
        }, 
        query: function() {
            db.openDoc(id, {
                success: function(q) {
                    var Query = app.getlib('query');
                    Query.query(app.db, q, function(ids) {
                        process_action._open_ids(ids, q.name, true);
                    }, function (err) {
                        app.libs.utils.showError(err);
                        process_action._open_ids([], q.name, true);
                    });
                }});
        },
        conflict: function() {
            db.view('datamanager/conflicts', {
                skip: skip,
                limit: limit,
                reduce: false,
                include_docs: true,
                success: function(conflict_data) {
                    callback('Conflicts', false, action, id, conflict_data, 
                             skip, limit, conflict_data.total_rows, conflict_data.rows.length, show_images);
                }
            });
        },
        lucene: function() {
            var query = app.getlib('query'),
                q = id;
            query.getDocs(db, q, skip, limit,
                    function(result) {
                        if (utilsLib.is_array(result)) { // some nasty boy searched for a ',' which leads to several result sets
                            if (result.length > 1) {
                                utilsLib.showWarning('Do not use "," in queries (except in a phrase between " ") - you may get unexpected results');
                            }
                            result = result[0];
                        }
                        callback(label, true, action, id, 
                                result, skip, limit, 
                                result.total_rows, result.rows.length, show_images);
                    }, 
                    function() {
                        app.libs.utils.showError('Query server error');
                        callback(label, true, action, id, 
                                [], skip, limit, 0, 0, show_images);
                    }
                );
        }
    };

    process_action[action]();
}