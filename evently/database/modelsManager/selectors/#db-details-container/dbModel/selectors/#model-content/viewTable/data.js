function(_id, name, mm_id, cols, modi, data, skip, limit, nb_rows, sort_params, total_rows, filter, query, mm_or_view, group, showImages) {
    //$.log('_id', _id, 'mm_id', mm_id, 'cols', cols, 'modi', modi, 'data', data, 'skip', skip, 'limit', limit,
    //      'nb_rows', nb_rows, 'sort_params', sort_params, 'total_rows', total_rows, 'filter', filter,
    //      'mm_or_view', mm_or_view, 'showImages', showImages);

    if (modi === null) {
        return {
            modelEmpty: true
        };
    }

    var app = $$(this).app,
        utilsLib = app.getlib('utils'),
        cacheLib = app.getlib('cache'),
        headers = [],
        rows = [],
        hasParents = false,
        hasColumnAttachs = false,
        enc_id = utilsLib.encode_design_id(_id);

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

    var process_view = function() {
        // create rows
        if (!data) {
            return;
        }
        // for each group of doc
        var num = 0;
        for (var d = 0; d < data.length; d++) {
            var row = data[d],
                row_data = [];

            // for each view col
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
                                    url = app.db.uri + $.couch.encodeDocId(row.$attachments[modi][ai].rowId) + '/' + a;
                                var found = (! group); // when grouping on a child module, parent attachments are repeated (* nb children)
                                for (var sai=0, sal=attachs.length; sai<sal && !found; sai++) {
                                    found = attachs[sai].name == a;
                                }
                                if ((! group) || (! found)) {
                                    attachs.push({
                                        name: a,
                                        shortFn: utilsLib.shorten(a, 17), //cracra
                                        img_url: at.content_type.match('image.*') ? url : 'img/attachment.png',
                                        is_image: at.content_type.match('image.*') ? true : false,
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

                    row_data.push({
                        _id: row.id, // for views, if of doc in the reference modi
                        odd: (num % 2 != 0),
                        has_attachments: attachs.length != 0 ? true : false,
                        attachments: attachs,
                        attachments_names: attachments_names
                    });
                } else {
                    if (utilsLib.is_array(formattedValue)) {
                        // @TODO simplifier ce test cracra
                        if (! ((type == 'geoloc' || type == 'multi-enum') && formattedValue.length > 0 && (! utilsLib.is_array(formattedValue[0])))) {
                            // force "longtext" for cells with multiple values
                            type = 'longtext';
                            formattedValue = formattedValue.join('<br/>');
                        }
                    }
                    row_data.push({ // for server-side views
                        value: formattedValue,
                        type: type
                    });
                }
            }

            rows.push({
                values: row_data,
                _id: row.id, // for views, if of doc in the reference modi
                odd: (num % 2 != 0)
            });
            num++;
        }
    };

    var process_mm = function() {
        var docs = data.rows,
            i, j, fn, r, row, v, a,
            attachs;

        // data
        var num = 0;
        for (i = 0; i < docs.length; i++) {
            r = docs[i].doc;
            row = [];

            for (j = 0; j < headers.length; j++) {
                fn = headers[j].field;

                // reinit
                attachs = [];
                if (fn === '_attchs') {
                    // Global indication for attachments
                    hasColumnAttachs = true;
                    
                    v = [];
                    for (a in r._attachments) {
                        var url = app.db.uri + $.couch.encodeDocId(r._id) + '/' + a,
                            at = r._attachments[a];
                        attachs.push({
                            name: a,
                            shortFn: utilsLib.shorten(a, 17), //cracra
                            img_url: at.content_type.match('image.*') ? url : 'img/attachment.png',
                            is_image: at.content_type.match('image.*') ? true : false,
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
                            img_url: url,
                            url: url
                            //is_image: true
                        });
                        // displayed value (obsolete?)
                        v.push(a);
                    }
                } else {
                    var type = cacheLib.get_field_type(app, mm_id, r.$modt, fn);
                    v = r[fn];
                }
                v = utilsLib.escape(v);
                if (type != undefined) {
                    v = utilsLib.formatFieldValue(v, type);
                }

                var attachments_names = '';
                for (var k = 0, m = attachs.length; k < m; k++) {
                    attachments_names += attachs[k].name;
                    if (k < m-1) {
                        attachments_names += ', ';
                    }
                }

                row.push({
                    value: v,
                    header : fn,
                    type: type,
                    _id: r._id,
                    has_attachments: attachs.length != 0 ? true : false,
                    attachments: attachs,
                    attachments_names: attachments_names
                });
            }

            var parent = utilsLib.get_parent(r);

            rows.push({
                values: row,
                _id: r._id,
                parent: parent || ' '
            });
            num++;
        }
    };

    // call process data depending of type of data
    if (mm_or_view.$type == 'view') {
        process_view();
    } else {
        process_mm();
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
    var tableWidth = 25 + (hasParents ? 150 : 0) + (150 * headers.length) + (hasColumnAttachs ? 450 : 0)+ 15;

    var isView = (mm_or_view.$type == 'view');

    return {
        modelEmpty: false,
        name: (name[0] == '.' ? cacheLib.get_name(app, mm_id, modi) : name),
        id: enc_id,
        filter_id: filter ? filter._id : '0',
        filter_name: filter ? filter.name : null,
        headers: headers,
        has_column_attachs: hasColumnAttachs,
        table_width: tableWidth,
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
        nb_rows: nb_rows,
        total_rows: total_rows,
        page: current_page,
        total_pages: total_pages,
        pagesBefore: pagesBefore,
        pagesAfter: pagesAfter,
        next: next,
        prev: prev,
        rowsPerPage: rowsPerPage,
        limit: limit,
        eltstart: eltstart,
        eltend: eltend,
        exactPagination: ((isView && group) || (! isView)),
        isRef: (mm_or_view.isref ? true : false)
    };
}