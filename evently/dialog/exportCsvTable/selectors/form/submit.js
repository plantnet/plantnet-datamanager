function(e) {
    var app = $$(this).app,
        cacheLib = app.getlib('cache'),
        ext = '.csv',
        params = e.data.args[1],
        id = params.id,
        name = params.name,
        mm_id = params.mm_id,
        cols = params.cols,
        modi = params.modi,
        //skip = params.skip,
        //limit = params.limit,
        query = params.query,
        view = params.view,
        sort = params.sort,
        group = params.group,
        filter = params.filter,
        separator = $('input[name="separator"]', this).val(),
        exportSynonymy = ($('input[name="export-synonymy"]', this).attr('checked') == 'checked');

    separator = separator.trim()[0]; 
    if (!separator) {
        separator = ',';
    }

    name = name.replace(' ', '_'); // @TODO something more secure

    if (id.slice(0, 10) == '_design/mm') {  // MODI OR MODT
        if (app.data.queryForExport) {
            download_query(name + '__' + app.data.queryForExport.name.replace(' ', '_') + '__' + ext);
        } else {
            download_modi(name + ext, cols, modi);
        }
    } else  { // view
        var fn = name + ext;
        download_view(fn, cols);
    }

    function download_view(fn, cols) {
        if (group === true) {
            alert("Warning: a grouped view cannot be re-imported. If you wish to re-import your data, use a flattened view instead.");
        }

        // get back modis' names from view cols, for further usage (CSV export) - cracra, should use libcache.get_name but cannot require !! wtf?
        var modi_labels = {};
        for (var i = 0; i < view.$cols.length; i++) {
            modi_labels[i] = view.$cols[i].label_modi;
        }
        $.log('view', view);

        filter = (filter) ? filter._id : filter; // wtf?

        var href = '/_dm/' + app.db.name + '/view?' +
            'view=' + JSON.stringify(id) +
            '&refmodi=' + modi +
            '&q=' + JSON.stringify(query) +
            // '&skip=' + skip + '&limit=' + limit + // export only the current page
            '&modilabels=' + JSON.stringify(modi_labels) +
            '&sort=' + JSON.stringify(sort) +
            '&filter=' + JSON.stringify(filter) +
            '&export_synonymy=' + JSON.stringify(exportSynonymy) +
            '&group=' + group +
            '&filename=' + fn +
            '&separator=' + separator +
            '&csv=true';

        downloadAndClose(href);
    }

    // pass the stored query to server-side view engine for export, using all and only the modi's cols
    function download_query(fn) {
        // build a fake view with all the columns of the modi
        var fakeView = {
                $mm: mm_id,
                $cols: [],
                $type: 'view',
                name: 'F.W. Abagnale Jr.'
            },
            modi_labels = {};
        var mm = cacheLib.get_cached_mm(app, mm_id);
        var modToRead = modi,
            field;
        if (modToRead[0] == '.') {
            modToRead = mm.structure[modToRead][0];
        }
        for (var i=0, l=mm.modules[modToRead].fields.length; i<l; i++) {
            field = mm.modules[modToRead].fields[i];
            fakeView.$cols.push({
                $modi: modi,
                field: field.name,
                label: field.label || field.name,
                label_modi: cacheLib.get_name(app, mm_id, modi),
                type: field.type
            });
        }
        for (var i = 0; i < fakeView.$cols.length; i++) { // shitty stuff
            modi_labels[i] = fakeView.$cols[i].label_modi;
        }

        filter = (filter) ? filter._id : filter; // wtf?

        var href = '/_dm/' + app.db.name + '/view?' +
            'view=' + JSON.stringify(fakeView) +
            '&refmodi=' + modi +
            '&q=' + JSON.stringify(app.data.queryForExport.query) +
            // '&skip=' + skip + '&limit=' + limit + // export only the current page
            '&modilabels=' + JSON.stringify(modi_labels) +
            '&sort=' + JSON.stringify(sort) +
            '&filter=' + JSON.stringify(filter) +
            '&export_synonymy=' + JSON.stringify(exportSynonymy) +
            '&group=' + group +
            '&filename=' + fn +
            '&separator=' + separator +
            '&csv=true';

        downloadAndClose(href);
    }

    function download_modi(fn, cols, mod) {
        if (mod[0] === "*") {
            mod = mod.slice(1); 
        }
        var modname = cacheLib.get_name(app, mm_id, mod),
            param = cols.slice(0); // array copy trick de la mort
        if (exportSynonymy) {
            param.push({
                $modi: mod,
                field: '_id',
                label: '$valid_name_id'
            });
            param.push({
                $modi: mod,
                field: '$synonym',
                label: '$synonym_of'
            });
        }
        var href = '_list/mod2csv/by_mod?' +
            'include_docs=true' +
            '&keys=[0, ["' + mm_id + '","' + mod + '"]]' +
            '&reduce=false' +
            '&fn=' + fn +
            '&param=' +  JSON.stringify(param) +
            '&separator=' + encodeURIComponent(separator) +
            '&modname=' + modname +
            //'&expand_geoloc=' + encodeURIComponent(expand_geoloc) +
            '&cache=' + JSON.stringify(new Date().getTime());

        downloadAndClose(href);
    }
    
    function downloadAndClose(href) {
        window.location.href = href;
        $('#export-csv-modal').modal('hide');
    }

    return false;
}