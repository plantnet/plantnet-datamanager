function (callback, e, params) {
    //$.log('Dans async.js de viewTable');
    var app = $$(this).app,
        viewLib = app.getlib('view'),
        utilsLib = app.getlib('utils'),
        cacheLib = app.getlib('cache'),
        queryLib = app.getlib('query'),
        id = params.id;

    var decoded_id = utilsLib.decode_design_id(id); // helps us guess if it is a mm

    var modi = params.modi,
        skip = parseInt(params.skip),
        nb_rows = parseInt(params.nb_rows),
        sort_field = params.sort_field,
        filter_id = params.filter_id,
        show_images = (params.show_images === 'true'),
        group = (params.group === 'true'),
        stored_mm_or_view = null;

    // sort on multiple fields
    var sort_params = utilsLib.sortParamsFromString(sort_field);
    //$.log('sort_params', sort_params);

    var limit = app.config.page_size;
    if (nb_rows && nb_rows > 0) {
        limit = nb_rows;
    }
    skip = skip ? parseInt(skip) : 0;

    // processes the filter (query doc, lucene query string or selection) for a mm display
    function process_filter(mm, filter_id) {

        if (filter_id.substr(0,7) == 'lucene:') {
            var q = filter_id.slice(7);
            var queryTerms = q.substr(0, q.indexOf(' AND')); // cracra
            queryLib.direct_lucene_query(app.db, q, function(ids) {
                    // save data for export
                    app.data.queryForExport = {
                        query: filter_id,
                        name: queryTerms
                    };
                    // call viewLib
                    viewLib.filter_mm_async(app, mm, ids, modi, sort_params, 
                        skip, limit, { name: '"' + queryTerms + '"', _id: filter_id }, extra_callback);
            }, function(err) {
                utilsLib.showError('Error during Lucene query: ' + err);
            });
        } else {
            app.db.openDoc(filter_id, {
                success : function(filter) {
                    if (filter.$type === 'query') {
                        // execute query
                        queryLib.query(app.db, filter, function(ids) {
                            // save data for export
                            app.data.queryForExport = {
                                query: filter,
                                name: filter.name
                            };
                            // call viewLib
                            viewLib.filter_mm_async(app, mm, ids, modi, sort_params, 
                                skip, limit, filter, extra_callback);
                        }, function(err) {
                            utilsLib.showError(err);
                        });
                    } else if (filter.$type === 'selection') {
                        // save data for export
                        app.data.sid = filter.sid = filter_id;
                        delete app.data.ids;
                        // call libviewLib
                        viewLib.filter_mm_async(app, view, filter.ids, modi, sort_params, 
                            skip, limit, filter, extra_callback);
                    }
                }
            });
        }
    }

    // if id is a mm
    if (decoded_id.substr(0,8) == '_design/') {
        var mm = cacheLib.get_cached_mm(app, decoded_id);
        stored_mm_or_view = mm;
        // if modi is not defined ('0' or anything false, usually when coming from pathbinder),
        // display the first one in the structure
        if (modi == '0' || (! modi)) {
            if (utilsLib.objectEmpty(mm.structure)) {
                // mm has no modules in its structure
                extra_callback(mm._id, mm._name, mm, null,
                        null, null, null, null, null, null, null, null, null);
                return;
            }
            // get first enumerated key - enum order is not guaranteed by spec but who cares!
            for (modi in mm.structure) break;
            // update infos for model menu
            app.infos.module.instance.id = modi;
        }
        // process filter if any: selection or query
        if (filter_id !== '0') {
            process_filter(mm, filter_id);
        } else { // simple mm display
            viewLib.mm_async(app, mm, modi, sort_params, skip, limit, extra_callback);
            app.infos.view.id = null;
            app.infos.view.name = null;
            $('#model-menu').trigger('_init');
        }
    } else {
        // datamanager "view"
        app.db.openDoc(id, {
            success: function(view) {
                stored_mm_or_view = view;
                 // server-side view, includes filter processing
                 viewLib.view_async(app, view, modi, sort_params, skip, limit, filter_id, group, extra_callback);
    
                // update app infos and reload model-menu
                app.infos.model.id = view.$mm.slice(8);
                app.infos.view.id = id;
                app.infos.view.name = view.name;
                $('#model-menu').trigger('_init');
            },
            error: function(a,b,c) {
                $.log(a,b,c);
            }
        });
    }

    // add extra parameters 'stored_mm_or_view', 'show_images' and 'group' to the default callback call
    function extra_callback(p_mm_id, p_name, p_$mm, p_cols,
            p_modi, p_data, p_skip, p_limit, p_length,
            p_sort_params, p_total_rows, p_filter, p_query) {

        callback(p_mm_id, p_name, p_$mm, p_cols, 
                p_modi, p_data, p_skip, p_limit, p_length,
                p_sort_params, p_total_rows, p_filter, p_query, stored_mm_or_view, group, show_images);
    }
}