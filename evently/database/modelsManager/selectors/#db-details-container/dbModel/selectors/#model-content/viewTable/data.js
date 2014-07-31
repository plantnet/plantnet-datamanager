function(_id, name, mm_id, cols, modi, data, skip, limit, nb_rows, sort_params, total_rows, filter, query, mm_or_view, group, showImages, showSyn) {
    //$.log('_id', _id, 'mm_id', mm_id, 'cols', cols, 'modi', modi, 'data', data, 'skip', skip, 'limit', limit,
    //      'nb_rows', nb_rows, 'sort_params', sort_params, 'total_rows', total_rows, 'filter', filter,
    //      'mm_or_view', mm_or_view, 'showImages', showImages);

    var app = $$(this).app,
        utilsLib = app.getlib('utils'),
        cacheLib = app.getlib('cache'),
        userRole = (app.userCtx && app.userCtx.currentDbRole) ? app.userCtx.currentDbRole : null,
        isSuperAdmin = (app.userCtx && app.userCtx.isSuperAdmin) ? app.userCtx.isSuperAdmin : null,
        isAdmin = (isSuperAdmin || userRole == 'admin') ? true : false,
        isWriter = (userRole == 'writer' || isAdmin) ? true : false,
        readonly = false,
        mayWrite = isWriter,
        headers = [],
        rows = [],
        isRef = false,
        hasParents = false,
        hasColumnAttachs = false,
        alovinColumn = {}, // at least one value in column
        enc_id = utilsLib.encode_design_id(_id);

    if (modi === null) {
        return {
            modelEmpty: true,
            is_admin: isAdmin,
            mm_id: mm_or_view._id.slice(8) // mm_id given in the function contains the mm object :( Wtf?
        };
    }

    var addDocPossible = false;
    if (mm_or_view.$type == 'mm') {
        for (var i=0, l=mm_or_view.addProneModules.length; i<l && !addDocPossible; i++) {
            if (mm_or_view.addProneModules[i].modi == modi) {
                addDocPossible = true;
            }
        }
    }

    // @TODO: merge the following 3 functions
    function getHeaderClass(sort_params, col_field, col_modi) {
        for (var i=0; i < sort_params.length; i++) {
            if ((sort_params[i].field + '' === col_field + '') && (sort_params[i].modi == col_modi)) {
                return sort_params[i].order > 0 ? 'asc' : 'desc';
            }
        }
        return '';
    }
    function getOrder(sort_params, col_field, col_modi) {
        for (var i=0; i < sort_params.length; i++) {
            if ((sort_params[i].field + '' === col_field + '') && (sort_params[i].modi == col_modi)) {
                var porder = - sort_params[i].order;
                return porder > 0 ? '' : '-';
            }
        }
    }
    function getPriority(sort_params, col_field, col_modi) {
        for (var i=0; i < sort_params.length; i++) {
            if ((sort_params[i].field + '' === col_field + '') && (sort_params[i].modi == col_modi)) {
                return i+1;
            }
        }
        return null;
    }

    //$.log('cols dans data de VT', cols);
    //$.log('headers', headers);
    // create header
    for (var c = 0; c < cols.length; c++) {
        var col = cols[c],
            h_modi = col.$modi ? col.$modi : modi,
            label_modi = cacheLib.get_name(app, mm_id, h_modi); // transform to real name

        var classCss = getHeaderClass(sort_params, col.field, h_modi),
            corder = getOrder(sort_params, col.field, h_modi),
            priority = getPriority(sort_params, col.field, h_modi);
        //$.log('Col.field', col.field);
        var encField = encodeURIComponent(col.field);
        if (utilsLib.is_array(col.field)) {
            encfield = null; // cannot sort on ref field - @TODO fix that
        }
        var h = {
            label: (col.label ? col.label : col.field),
            long_label: label_modi,
            description: col.description,
            hasTooltip: col.description,
            modi: h_modi,
            'class': classCss,
            corder: corder,
            priority: priority,
            enc_field: encField,
            field: col.field,
            is_column_attach: (col.field === '_attchs' ? true : false)
        };
        
        // split field name if composite
        if (typeof (col.field) === 'object') {
            h.field = col.field.join(',');
            var fmodi = col.field[2],
                fname = col.field[1];
            h.label = cacheLib.get_name(app, col.mm_ref_id, fmodi) + ' (' + fname + ')';
        }
        //$.log('header', col, h);
        headers.push(h);
    }

    // displays the result of a view
    var process_view = function() {
        // create rows
        if (!data) {
            return;
        }

        // is the mm a dictionary?
        var cachedMm = cacheLib.get_cached_mm(app, mm_or_view.$mm);
        isRef = cachedMm && cachedMm.isref;

        // for each group of doc
        var num = 0;
        for (var d = 0; d < data.length; d++) {
            var row = data[d],
                row_data = [],
                geoloc = null,
                rowLabel = null;

            // for each view col
            //$.log('view row', row);
            for (c=0; c < mm_or_view.$cols.length; c++) {
                var formattedValue = row[c],
                    type = mm_or_view.$cols[c].type,
                    modi = mm_or_view.$cols[c].$modi,
                    name = mm_or_view.$cols[c].field;
                if (name == '_attchs') {
                    // Global indication for attachments
                    hasColumnAttachs = true;
                    var attachs = [];
                    if (row.$attachments && row.$attachments[modi]) {
                        for (var ai=0, al=row.$attachments[modi].length; ai<al; ai++) {
                            for (var a in row.$attachments[modi][ai].data) {
                                var at = row.$attachments[modi][ai].data[a],
                                    isExternal = (! at.content_type),
                                    found = (! group), // when grouping on a child module, parent attachments are repeated (* nb children)
                                    url,
                                    is_image;

                                if (isExternal) {
                                    url = a;
                                    is_image = utilsLib.hasImageExtension(a);
                                } else {
                                    url = app.db.uri + $.couch.encodeDocId(row.$attachments[modi][ai].rowId) + '/' + a;
                                    is_image = at.content_type.match('image.*');
                                }
                                // has attachment been already treated?
                                for (var sai=0, sal=attachs.length; sai<sal && !found; sai++) {
                                    found = attachs[sai].name == a;
                                }
                                if ((! group) || (! found)) {
                                    attachs.push({
                                        name: a,
                                        shortFn: utilsLib.shorten(a, 17), //cracra
                                        is_image: is_image,
                                        url: url,
                                        fn: a
                                    });
                                }
                            }
                        }
                    }

                    var attachments_names = '';
                    for (var k = 0, m = attachs.length; k < m; k++) {
                        attachments_names += attachs[k].name;
                        if (k < m-1) {
                            attachments_names += ', ';
                        }
                    }

                    if (attachments_names) {
                        alovinColumn[name] = true;
                    }

                    row_data.push({
                        _id: row.id, // for views, if of doc in the reference modi
                        odd: (num % 2 != 0),
                        has_attachments: attachs.length != 0 ? true : false,
                        attachments: attachs,
                        attachments_names: attachments_names
                    });
                } else {
                    // regular columns (not attachments)
                    if (utilsLib.is_array(formattedValue)) {
                        // @TODO simplifier ce test cracra
                        if (! ((type == 'geoloc' || type == 'multi-enum') && formattedValue.length > 0 && (! utilsLib.is_array(formattedValue[0])))) {
                            // force type for cells with multiple values
                            type = 'multilines';
                            formattedValue = formattedValue.join('\n');
                        }
                    }

                    // add ref data
                    var refid = null;
                    if (row.$ref && row.$ref[c]) {
                        refid = row.$ref[c];
                    }

                    if (type == 'geoloc') {
                        geoloc = formattedValue;
                    }

                    var isLabel = (name == '$label');
                    if (isLabel) {
                        rowLabel = formattedValue;
                    }

                    //if (formattedValue !== undefined && formattedValue !== null) {
                    if (formattedValue) {
                        alovinColumn[name] = true;
                    }

                    row_data.push({
                        value: formattedValue,
                        is_label: isLabel,
                        type: type,
                        is_url: (type == 'url') ? true : false,
                        ref_id: refid
                    });
                }
            }

            rows.push({
                values: row_data,
                meta: row.$meta,
                _id: row.id, // for views, if of doc in the reference modi
                odd: (num % 2 != 0),
                isSynonym: row.$synonym,
                geoloc: geoloc,
                hasGeoloc: !!geoloc,
                row_label: rowLabel
            });
            num++;
        }
    };

    // displays the content of a given module in a structure
    var process_mm = function() {
        var docs = data.rows,
            i, j, fn, r, row, v, a,
            geoloc,
            rowLabel,
            attachs;

        isRef = mm_or_view.isref;

        // data
        var num = 0;
        for (i = 0; i < docs.length; i++) {
            r = docs[i].doc;
            row = [];
            geoloc = null;
            rowLabel = null;

            for (j = 0; j < headers.length; j++) {
                fn = headers[j].field;

                // reinit
                attachs = [];
                var type;
                if (fn === '_attchs') {
                    type = 'attchs'
                    // Global indication for attachments
                    hasColumnAttachs = true;

                    v = [];
                    for (a in r._attachments) {
                        var url = app.db.uri + $.couch.encodeDocId(r._id) + '/' + a,
                            at = r._attachments[a],
                            is_image = at.content_type.match('image.*');
                        attachs.push({
                            name: a,
                            shortFn: utilsLib.shorten(a, 17), //cracra
                            is_image: is_image ? true : false,
                            url: url,
                            fn: a
                        });
                        // displayed value (obsolete?)
                        v.push(a);
                    }
                    for (a in r.$attachments) {
                        var attachment = r.$attachments[a],
                            url = attachment.url;
                        attachs.push({
                            name: a,
                            shortFn: utilsLib.shorten(a, 17), //cracra
                            is_image: utilsLib.hasImageExtension(url),
                            url: url
                        });
                        // displayed value (obsolete?)
                        v.push(a);
                    }
                } else {
                    type = cacheLib.get_field_type(app, mm_id, r.$modt, fn);
                    v = r[fn];
                    if (v) {
                    //if (v !== undefined && v !== null) {
                        alovinColumn[fn] = true;
                    }
                    if (type == 'geoloc') {
                        geoloc = v;
                    }
                    if (fn =='$label') {
                        rowLabel = v;
                    }
                }
                //v = utilsLib.escape(v, true); // gné?
                if (type != undefined) {
                    v = utilsLib.formatFieldValue(v, type, false); // fancy display step 1
                }

                var attachments_names = '';
                for (var k = 0, m = attachs.length; k < m; k++) {
                    if (attachs[k] && attachs[k].name) {
                        attachments_names += attachs[k].name;
                        if (k < m-1) {
                            attachments_names += ', ';
                        }
                    }
                }

                if(attachments_names){
                    alovinColumn[fn] = true;
                }

                // add ref data
                var refid = null,
                    tooltip = [];
                if (r.$ref && r.$ref[fn]) {
                    for (refmodi in r.$ref[fn]) {
                        if (refmodi === '_id') {
                            refid = r.$ref[fn]._id;
                            continue;
                        }
                        tooltip.push(r.$ref[fn][refmodi]);
                    }
                }

                row.push({
                    value: v,
                    header : fn,
                    type: type,
                    _id: r._id,
                    is_label: (fn == '$label') ? true : false,
                    is_url: (type == 'url') ? true : false,
                    has_attachments: attachs.length != 0 ? true : false,
                    attachments: attachs,
                    attachments_names: attachments_names,
                    ref_id: refid,
                    tooltip: tooltip,
                    has_tooltip: tooltip && tooltip.length
                });
            }

            var parent = utilsLib.get_parent(r);

            rows.push({
                values: row,
                meta: r.$meta,
                _id: r._id,
                $mm: r.$mm,
                parent: parent || ' ',
                is_synonym: r.$synonym,
                geoloc: geoloc,
                hasGeoloc: !!geoloc,
                row_label: rowLabel
            });
            num++;
        }
    };

    // call process data depending of type of data
    if (mm_or_view.$type == 'view') {
        process_view();
    } else {
        // is this structure readonly?
        if (mm_or_view.readonly === true) {
            readonly = true;
        }
        mayWrite = (isAdmin || (isWriter && (! readonly)));
        process_mm();
    }

    // are there empty columns?
    var indexOfEmptyColumns = [];
    for (var j=0; j < headers.length; j++) {
        if (! alovinColumn[headers[j].field]) {
            headers[j].columnEmpty = true;
            indexOfEmptyColumns.push(j);
            headers[j].label_ellipsed = headers[j].label.substr(0,3) + '...';
            if (headers[j].long_label) {
                headers[j].long_label_ellipsed = headers[j].long_label.substr(0,3) + '...';
            }
            headers[j].hasTooltip = true;
        }
    }
    for (var j=0; j < rows.length; j++) {
        for (var k=0; k < indexOfEmptyColumns.length; k++) {
            var cell = rows[j].values[indexOfEmptyColumns[k]];
            cell.columnEmpty = true;
        }
    }

    // pages
    var prev, 
        next,
        current_page = (Math.ceil(skip / limit) + 1),
        total_pages = Math.ceil(total_rows / limit);

    // direct links to pages
    var pagesBefore = [], pagesAfter = [];
    if ((total_pages <= 10) || (current_page <= 5)) {
        for (var i = 1; i < current_page; i++) {
            pagesBefore.push({
                pn: i,
                lskip: Math.max((skip - ((current_page - i) * limit)), 0)
            });
        }
        for (var i = (current_page + 1); i <= Math.min(total_pages, 10); i++) {
            pagesAfter.push({
                pn: i,
                lskip: (skip + ((i - current_page) * limit))
            });
        }
    } else {
        if (current_page >= (total_pages - 5)) {
            for (var i = (total_pages - 9); i < current_page; i++) {
                pagesBefore.push({
                    pn: i,
                    lskip: Math.max((skip - ((current_page - i) * limit)), 0)
                });
            }
            for (var i = (current_page + 1); i <= total_pages; i++) {
                pagesAfter.push({
                    pn: i,
                    lskip: (skip + ((i - current_page) * limit))
                });
            }
        } else {
            for (var i = (current_page - 4); i < current_page; i++) {
                pagesBefore.push({
                    pn: i,
                    lskip: Math.max((skip - ((current_page - i) * limit)), 0)
                });
            }
            for (var i = (current_page + 1); i <= (current_page + 5); i++) {
                pagesAfter.push({
                    pn: i,
                    lskip: (skip + ((i - current_page) * limit))
                });
            }
        }
    }

    if (skip > 0) {
        prev = {
            skip: Math.max(0, skip - limit)
        };
    }

    if ((skip + limit) < total_rows) {
        next = {
            skip: skip + limit
        };
    }

    // number of rows per page
    var rppopt = [10,25,50,100,200],
        rowsPerPage = [];
    for (var i = 0; i < rppopt.length; i++) {
        var opt = rppopt[i];
        rowsPerPage.push({
            number: opt,
            selected: (limit == opt) ? true : false,
            skip: skip
        });
    }

    // current elements
    var eltstart = skip;
    var eltend = eltstart + limit;
    if (rows.length < limit) {
        eltend = eltstart + rows.length;
    }
    eltstart = eltstart+1;
    
    // Table style
    // 25px for input checkbox + 150px per colunm + 450px for attachs column + 15px for scrollbar
    //var tableWidth = 25 + (hasParents ? 150 : 0) + (150 * headers.length) + (hasColumnAttachs ? 450 : 0)+ 15;

    var isView = (mm_or_view.$type == 'view');

    // last page
    var last_page = (total_pages * limit) - limit;
    // jump to page x
    var pages = [];
    for (var i = 0; i < total_pages; i++) {
        pages.push({
            jump_page: i + 1,
            jump_skip: i * limit,
            selected: (i + 1) == current_page ? true : false
        });
    }

    return {
        modelEmpty: false,
        name: (name[0] == '.' ? cacheLib.get_name(app, mm_id, modi) : name),
        isModi: (modi[0] == '.' ? true : false),
        id: enc_id,
        filter_id: filter ? filter._id : '0',
        filter_name: filter ? filter.name : null,
        hasFilter: filter,
        headers: headers,
        has_column_attachs: hasColumnAttachs,
        //table_width: tableWidth,
        rows: rows,
        has_rows: !! rows.length > 0,
        hasParents: hasParents,
        modi: modi,
        modiName: cacheLib.get_name(app, mm_id, modi),
        isView: isView,
        group: group,
        sort: utilsLib.sortParamsToString(sort_params, '_id'),
        add_doc_possible: addDocPossible,
        show_pagination: true, // ah bravo!
        show_images: showImages,
        showSyn: showSyn,
        nb_rows: nb_rows,
        total_rows: total_rows,
        page: current_page,
        pages: pages,
        total_pages: total_pages,
        last_page : last_page,
        pagesBefore: pagesBefore,
        pagesAfter: pagesAfter,
        next: next,
        prev: prev,
        rowsPerPage: rowsPerPage,
        limit: limit,
        eltstart: eltstart,
        eltend: eltend,
        unique: mm_or_view.$unique,
        exactPagination: ((isView && group) || (! isView)),
        isRef: isRef,
        is_admin: isAdmin,
        //is_writer: isWriter
        is_writer: mayWrite
    };
}
