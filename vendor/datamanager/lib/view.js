var Query = require('vendor/datamanager/lib/query');
var Cache = require('vendor/datamanager/lib/cache');

// get viewTable data for a filter (selection or query)
exports.filter_mm_async = function (app, mm, ids, mod, sort_params, skip, limit, filter, callback) {

    ids = ids.unique();

    // compute name
    var modt,
        name;

    if (mod[0] == '*') {
        mod = mod.slice(1); // remove '*' // wtf? ugly patch
    }

    //$.log('filter_mm_async', ids.length);
    if (mod[0] == '.') { // query on a modi
        modt = mod.substring(mod.lastIndexOf('.') + 1);
        name = Cache.get_name(app, mm._id, mod);
    } else {
        modt = mod,
        //$.log('on modt', 'mod', mod, 'modt', modt);
        name = mm.modules[modt].name;
    }
    //$.log('C', 'mod', mod, 'modt', modt, 'name', name);

    // compute cols
    var cols = [],
        fields = mm.modules[modt].fields;

    // show label as first col
    cols.push({
        field: '$label',
        label: '_label'
    });

    // regular cols
    for (var i = 0, l = fields.length; i < l; i++) {
        var fieldName = fields[i].name,
            fieldLabel = fields[i].label;
        cols.push({
            field: fieldName, 
            label: fieldLabel || fieldName
        });
    }
    $.log('go to sort', ids.length, mm._id, mod, sort_params);
    $.log(ids[0]);
    $.log(ids[1]);
    $.log(ids[2]);

    Query.sort_selection(app, ids, mm._id, mod, false, sort_params, 
        function(sorted_ids) {
            //$.log('sorted ids', sorted_ids.length);
            var total_rows = sorted_ids.length; 
            // select page
            $.log('sid length', sorted_ids.length);
            sorted_ids = sorted_ids.slice(skip, skip + limit);
            $.log('sid length', sorted_ids.length);
            // get view data
            app.db.allDocs({
                keys: sorted_ids,
                include_docs: true,
                success: function(rows) {
                    callback(mm._id, name, mm._id, cols, 
                            mod, rows, skip, limit, sorted_ids.length,
                            sort_params, total_rows, filter);
                }, 
                error: function() {
                    throw 'cannot get docs in filter_mm_async';
                }
            });
        });
};

// displays a mm
exports.mm_async = function(app, mm, modi, sort_params, skip, limit, callback) {

    var field,
        key;
    if (modi[0] === '*') {
        field = '_modt';
        key = modi.slice(1);
    } else {
        field = '_modi';
        key = modi;
    }

    // compute name
    var modt,
        name;

    if (modi in mm.structure) {
        modt = mm.structure[modi][0];
        name = Cache.get_name(app, mm._id, modi);
   } else if (modi[0] === '*') {
       modt = modi.slice(1);
       name = mm.modules[modt].name;
    }

    // compute cols
    var cols = [],
        fields = mm.modules[modt].fields,
        withattchs = mm.modules[modt].withimg || mm.modules[modt].withattchs;

    // show label as first col
    cols.push({
        field: '$label',
        label: '_label'
    });

    // regular cols
    for (var i = 0, l = fields.length; i < l; i++) {
        var fieldName = fields[i].name,
            fieldLabel = fields[i].label;
        cols.push({
            field: fieldName, 
            label: fieldLabel || fieldName
        });
        // get types for sort fields
        for (var j=0; j < sort_params.length; j++) {
            if (fieldName == sort_params[j].field) {
                sort_params[j].type = fields[i].type;
            }
        }
    }

    if (withattchs) {
        cols.push({field: '_attchs'});
    }

    function proc_res(data) {
        callback(mm._id, name, mm._id, cols, modi, data, skip, limit,
                 data.rows.length, sort_params, data.total_rows, null);
    }
    
    var q = {
        '$mm': mm._id
    };
    q[field] = key;
    //$.log('launching Query.lucene_query', q);
    Query.lucene_query(app.db, proc_res, q, skip, limit, true, sort_params/*_lucene*/);
};

// executes a view, with or without filter (query or selection)
exports.view_async = function(app, view, modi, sort_params, skip, limit, filter_id, group, callback) {

    // test empty view
    if (!view.$cols || !view.$cols.length) {
        alert('View has no column');
        return;
    }

    // module type - modi of first column if none is specified
    if (modi + '' === '0') {
        modi = view.$cols[0].$modi;
    }

    // trivial query (see below)
    var q = {
        $modi: modi,
        $mm: view.$mm
    };
    var modt = modi.split('.').last();

    // get types for sort fields
    for (var j=0; j < sort_params.length; j++) {
        sort_params[j].type = Cache.get_field_type(app, view.$mm, modt, sort_params[j].field);
    }

    // add modis' names in view cols, for further usage (CSV export)
    var label_modi;
    //var modi_labels = {};
    for (var c=0; c < view.$cols.length; c++) {
        label_modi = Cache.get_name(app, view.$mm, view.$cols[c].$modi); // transform to real name
        view.$cols[c].label_modi = label_modi;
        //modi_labels[c] = label_modi;
    }

    // server-side views, including Lucene query and filters processing
    app.db.dm('view', {
        view: JSON.stringify(view._id),
        refmodi: modi,
        q: JSON.stringify(q), // trivial query, could be created server-side...
        filter: JSON.stringify(filter_id),
        qskip: skip,
        qlimit: limit,
        sort: JSON.stringify(sort_params),
        group: group
    }, null, function(serverViewData) {
        // indirectly call viewtable/data.js
        callback(view._id, view.name, view.$mm, view.$cols, 
                 modi, serverViewData.rows, skip, limit, serverViewData.nb_rows,
                 sort_params, serverViewData.total_rows, serverViewData.filter, q);
    }, function(err) {
        $.log('foirax depuis libView', err);
    });
};