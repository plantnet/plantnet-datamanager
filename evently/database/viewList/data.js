function(title, isQuery, action, id, docs, skip, limit, total_rows, nb_rows, showImages) {

    var app = $$(this).app,
        cache = app.getlib('cache'),
        utilsLib = app.getlib('utils'),
        userRole = (app.userCtx && app.userCtx.currentDbRole) ? app.userCtx.currentDbRole : null,
        isSuperAdmin = (app.userCtx && app.userCtx.isSuperAdmin) ? app.userCtx.isSuperAdmin : null,
        isAdmin = (isSuperAdmin || userRole == 'admin') ? true : false,
        isWriter = (userRole == 'writer' || isAdmin) ? true : false;

    var rows = [];

    // Gets all values of all fields in doc and places them in dst
    function dumpDocFields(doc, dst) {
        for (var field in doc) {
            if (field[0] != '_' && field[0] != '$') {
                dst.content.push({
                    'key': field,
                    'value': doc[field]
                 });
            }
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

    for (var i = 0, l = docs.rows.length; i < l; i++) {
        //$.log('avt gn', i, 'src: ', docs.rows[i]);
        var src = docs.rows[i],
            dst = {
                id: src.id,
                index: i + skip,
                content: []
            };

        if (src.doc) {
            dst.type = 'Special doc';
            dst.label = src.doc.$label || src.doc._id;
            dst.$mm = src.doc.$mm;
            if (src.doc.$modi) {
                dst.type = cache.get_name(app, src.doc.$mm, src.doc.$modi);
            } else if (src.doc._id.substr(0, 8) == '_design/') {
                dst.type = '[Structure definition]';
                dst.label = src.doc.name;
                dst.isDdoc = true;
            } else if (src.doc.$type == 'view') {
                dst.type = '[View]';
                dst.label = src.doc.name;
                dst.isView = true;
            } else if (src.doc.$type == 'query') {
                dst.type = '[Query]';
                dst.label = src.doc.name;
                dst.isQuery = true;
            }
            dst.uid = (src.doc._id.split("##")[1]) || src.doc._id;

            // regular doc - browse fields
            if (src.doc.$mm && src.doc.$modt) {
                var mm = cache.get_cached_mm(app, src.doc.$mm),
                    modfield,
                    type,
                    geoloc = null;
                if (mm) {
                    for (var k = 0, kl = mm.modules[src.doc.$modt].fields.length; k < kl; k++) {
                        modfield = mm.modules[src.doc.$modt].fields[k];
                        if (src.doc[modfield.name]) {
                            dst.content.push({
                                'key': modfield.label || modfield.name,
                                'title': modfield.name,
                                'value': app.libs.utils.escape(src.doc[modfield.name])
                             });
                        }
                        // geoloc?
                        if (modfield.type == 'geoloc') {
                            //$.log('found geo in list', modfield.name, src.doc[modfield.name]);
                            geoloc = src.doc[modfield.name];
                        }
                    }
                    dst.geoloc = geoloc;
                    dst.hasGeoloc = !!geoloc;
                } else { // design doc for structure is not in the database
                    //utilsLib.showError('Could not find structure for "' + src.doc.$label + '" - orphan document?');
                    dumpDocFields(src.doc, dst);
                }
            } else { // special docs, like $wiki, views, queries
                if (dst.isDdoc) {
                    dst.content.push({
                        'key': 'name',
                        'title': 'name',
                        'value': app.libs.utils.escape(src.doc.name)
                     });
                    dst.content.push({
                        'key': 'desc',
                        'title': 'description',
                        'value': app.libs.utils.escape(src.doc.desc)
                     });
                } else {
                    dumpDocFields(src.doc, dst);
                }
            }
            // include attachments
            dst.attachments = [];
            
            for (var a in src.doc.$attachments) {
                var attachment = src.doc.$attachments[a];
                var url = attachment.url;
                dst.attachments.push({
                    name: a, 
                    img_url: url,
                    url: url
                });
            }
            for (var a in src.doc._attachments) {
                var url = app.db.uri + $.couch.encodeDocId(src.doc._id) + '/' + a,
                at = src.doc._attachments[a];
                dst.attachments.push({
                    name: a,
                    img_url: at.content_type.match('image.*') ? url : 'img/attachment.png',
                    is_image: at.content_type.match('image.*') ? true : false,
                    url: url,
                    fn: a,
                    shortFn: app.libs.utils.shorten(a,17) //cracra
                });
            }
            
            if (action === 'conflict' || (src.value && src.doc._conflicts)) {
                // case of a duplication
                if ((utilsLib.is_array(src.key)) && (src.key[0] == 0)) {
                    dst.link_action = 'viewdups';
                    dst.cmd_class = 'conflict-duplicates';
                    dst.id = src.key[1];
                    dst.old_id = src.doc._id;
                } else {
                    if (dst.isDdoc) {
                        dst.id = dst.id.replace('/','|'); // cracra hack
                    }
                    dst.link_action = 'viewrevs';
                    dst.isRevs = true;
                    dst.cmd_class = 'conflict-revisions';
                }
            }
        } else { // no doc!
            dst.deleted = true;
            //dst.other_cmd = false;
            dst.label = 'Doc was deleted !';
        }

        rows.push(dst);
    }

    // current elements
    var eltstart = skip;
    var eltend = eltstart + limit;
    if(rows.length < limit) {
        eltend = eltstart + rows.length;
    }
    eltstart = eltstart+1;

    return {
        title: title,
        isQuery: isQuery,
        isConflict: (action === 'conflict'),
        isSelection: (action === 'select'),
        link_action: 'viewdoc',
        cmd_class: 'details',
        other_cmd: (action === 'select') ? true : false,
        param: encodeURIComponent(id),
        rows: rows,
        nb_rows: nb_rows,
        total_rows: total_rows,
        page: current_page,
        next: next,
        prev: prev,
        eltstart: eltstart,
        eltend: eltend,
        total_pages: total_pages,
        pagesBefore: pagesBefore,
        pagesAfter: pagesAfter,
        action: action,
        show_pagination: (total_rows / limit) > 1,
        show_images: showImages,
        is_writer: isWriter
    };
}