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
        exportSynonymy = ($('input[name="export-synonymy"]', this).attr('checked') == 'checked'),
        olpa = ($('input[name="olpa"]', this).attr('checked') == 'checked'),
        label_field = ($('input[name="label-field"]', this).attr('checked') == 'checked'),
        id_field = ($('input[name="id-field"]', this).attr('checked') == 'checked');

    var is_custom_view = false;
    if (view.$type && view.$type == 'view') {
        is_custom_view = true;
    }

    var newcols = [];
    if (id_field && !is_custom_view) {
        cols = [{field: '_id', label: '_id'}].concat(cols);
    }
    // separate attachments in 2 columns in export
    for (var i=0; i<cols.length; i++) {
        if (cols[i].field == '_attchs') {
            newcols.push({
                $modi: cols[i].$modi,
                field: '_attchs_files',
                label: '_attchs_files',
                label_modi: cols[i].label_modi, // risky
                //label_modi: '',
                type: 'attch'
            });
            newcols.push({
                $modi: cols[i].$modi,
                field: '_attchs_urls',
                label: '_attchs_urls',
                label_modi: cols[i].label_modi, // risky
                //label_modi: '',
                type: 'attch'
            });
        } else {
            if (cols[i].field == '$label' && !label_field && !is_custom_view) {
                // $.log('$label','!push');
            } else {
                newcols.push(cols[i]);
            }
        }
    }
    cols = newcols;

    separator = separator.trim()[0]; 
    if (!separator) {
        separator = ',';
    }

    name = name.replace(/ /g, '_'); // @TODO something more secure

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

    // exports the result of a server-side view
    function download_view(fn, cols) {
        if (group === true) {
            alert("Warning: a grouped view cannot be re-imported. If you wish to re-import your data, use a flattened view instead.");
        }

        if (cols) {
            view.$cols = cols;
        }

        // synonymy based on modi of 1st col
        if (exportSynonymy) {
            view.$cols.push({
                $modi: view.$cols[0].$modi,
                field: '_id',
                label: '$valid_name_id',
                label_modi: view.$cols[0].label_modi,
                type: 'text'
            });
            view.$cols.push({
                $modi: view.$cols[0].$modi,
                field: '$synonym',
                label: '$synonym_of',
                label_modi: view.$cols[0].label_modi,
                type: 'text'
            });
        }

        // get back modis' names from view cols, for further usage (CSV export) - cracra, should use libcache.get_name but cannot require !! wtf?
        var modi_labels = {};
        for (var i = 0; i < view.$cols.length; i++) {
            modi_labels[i] = view.$cols[i].label_modi;
        }

        filter = (filter) ? filter._id : filter; // wtf?

        genFormAndSubmit(view, modi, query, modi_labels, sort, filter, group, olpa, fn, separator);
        downloadAndClose(null);
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
            modiLabel = cacheLib.get_name(app, mm_id, modi),
            field;
        if (modToRead[0] == '.') {
            modToRead = mm.structure[modToRead][0];
        }
        // label column
        fakeView.$cols.push({
            $modi: modi,
            field: '$label',
            label: '_label',
            label_modi: modiLabel,
            type: 'text'
        });
        // modi columns
        for (var i=0, l=mm.modules[modToRead].fields.length; i<l; i++) {
            field = mm.modules[modToRead].fields[i];
            fakeView.$cols.push({
                $modi: modi,
                field: field.name,
                label: field.label || field.name,
                label_modi: modiLabel,
                type: field.type
            });
        }

        // attachments columns
        if (mm.modules[modToRead].withattchs) {
            fakeView.$cols.push({
                $modi: modi,
                field: '_attchs_files',
                label: '_attchs_files',
                label_modi: modiLabel,
                type: 'attch'
            });
            fakeView.$cols.push({
                $modi: modi,
                field: '_attchs_urls',
                label: '_attchs_urls',
                label_modi: modiLabel,
                type: 'attch'
            });
        }

        // synonymy based on modi of 1st col
        if (exportSynonymy) {
            fakeView.$cols.push({
                $modi: fakeView.$cols[0].$modi,
                field: '_id',
                label: '$valid_name_id',
                label_modi: fakeView.$cols[0].label_modi,
                type: 'text'
            });
            fakeView.$cols.push({
                $modi: fakeView.$cols[0].$modi,
                field: '$synonym',
                label: '$synonym_of',
                label_modi: fakeView.$cols[0].label_modi,
                type: 'text'
            });
        }

        for (var i = 0; i < fakeView.$cols.length; i++) { // shitty stuff
            modi_labels[i] = fakeView.$cols[i].label_modi;
        }

        filter = (filter) ? filter._id : filter; // wtf?

        genFormAndSubmit(fakeView, modi, app.data.queryForExport.query, modi_labels, sort, filter, group, olpa, fn, separator);
        downloadAndClose(null);
    }

    // exports the contents of a given modi in a structure
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
            '&olpa=' + olpa +
            //'&expand_geoloc=' + encodeURIComponent(expand_geoloc) +
            '&cache=' + JSON.stringify(new Date().getTime());

        downloadAndClose(href);
    }

    // builds a custom form to POST to a new page and obtain the download prompt
    function genFormAndSubmit(view, modi, query, modi_labels, sort, filter, group, olpa, fn, separator) {
        var newForm = '<form id="new-post-form" target="_blank" method="post" action="/_dm/' + app.db.name + '/view">';
        newForm += '<input type="hidden" name="view">'; // with modified columns
        newForm += '<input type="hidden" name="refmodi" value="' + modi + '">';
        newForm += '<input type="hidden" name="q">';
        newForm += '<input type="hidden" name="modilabels">';
        newForm += '<input type="hidden" name="sort">';
        newForm += '<input type="hidden" name="filter">';
        newForm += '<input type="hidden" name="group" value="' + group + '">';
        newForm += '<input type="hidden" name="olpa" value="' + olpa + '">';
        newForm += '<input type="hidden" name="filename" value="' + fn + '">';
        newForm += '<input type="hidden" name="separator" value="' + separator + '">';
        newForm += '<input type="hidden" name="csv" value="true">';
        newForm += '</form>';
        // append and submit it
        var strView =JSON.stringify(view) || '';
        var strQuery =JSON.stringify(query) || '';
        var strModiLabels =JSON.stringify(modi_labels) || '';
        var strSort =JSON.stringify(sort) || '';
        var strFilter =JSON.stringify(filter) || '';
        $('#export-csv-table-modal').append(newForm);
        $('#new-post-form input[name="view"]').val(strView // val() does proper escaping easily
            .replace(/&/g, '%26') // replacing because those 3 characters are used in user_server to parse the form-urlencoded params (cracra)
            .replace(/\+/g, '%2B')
            .replace(/=/g, '%3D'));
        $('#new-post-form input[name="query"]').val(strQuery
            .replace(/&/g, '%26')
            .replace(/\+/g, '%2B')
            .replace(/=/g, '%3D'));
        $('#new-post-form input[name="modi_labels"]').val(strModiLabels
            .replace(/&/g, '%26')
            .replace(/\+/g, '%2B')
            .replace(/=/g, '%3D'));
        $('#new-post-form input[name="sort"]').val(strSort
            .replace(/&/g, '%26')
            .replace(/\+/g, '%2B')
            .replace(/=/g, '%3D'));
        $('#new-post-form input[name="filter"]').val(strFilter
            .replace(/&/g, '%26')
            .replace(/\+/g, '%2B')
            .replace(/=/g, '%3D'));
        $('#new-post-form').submit();
    }

    function downloadAndClose(href) {
        if (href !== null) {
            window.location.href = href;
        }
        $('#export-csv-table-modal').modal('hide');
        delete app.data.queryForExport;
    }

    return false;
}