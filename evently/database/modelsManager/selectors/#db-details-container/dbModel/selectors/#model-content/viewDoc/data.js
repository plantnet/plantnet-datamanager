function(id, mm, related, synLabels) {
    var app = $$(this).app,
        utilsLib = app.getlib('utils'),
        docs = [],
        subDocs = {},
        mmLib = app.getlib('mm'),
        cacheLib = app.getlib('cache'),
        userRole = (app.userCtx && app.userCtx.currentDbRole) ? app.userCtx.currentDbRole : null,
        isSuperAdmin = (app.userCtx && app.userCtx.isSuperAdmin) ? app.userCtx.isSuperAdmin : null,
        isAdmin = (isSuperAdmin || userRole == 'admin') ? true : false,
        isWriter = (userRole == 'writer' || isAdmin) ? true : false,
        moduleSons = mmLib.get_modis_by_parent(mm);

    app.data.moduleSons = moduleSons;

    // organize docs by id
    for (var d = 0; d < related.rows.length; d++) {
        var doc = related.rows[d].doc;
        if (doc) {
            subDocs[doc._id] = doc;
        }
    }

    // build view data
    for (var subId in subDocs) {
        var subDoc = subDocs[subId],
            level = subDoc.$path.length,
            parent_id = subDoc.$path.last(),
            pth = subDoc.$path.concat([subDoc._id]),
            sp_modi = subDoc.$modi.split('.');

        // create a string to sort correly docs
        pth = pth.map(function (e) {
            var d = subDocs[e];
            if(e) {
                return e + mm.modules[d.$modt].name + d.$label;
            } else {
                return "##";
            }
        });
        pth = pth.join('');

        if(subDoc.$meta) {
            pth += subDoc.$meta.created_at;
        }

        var module = mm.modules[subDoc.$modt],
            msons = moduleSons[subDoc.$modi];

        // try to find a geoloc
        var geoloc;
        for (var k in subDoc) {
            var fv = subDoc[k];
            if (fv && fv.length == 2 && typeof(fv[0]) == "number" && typeof(fv[1]) == "number") {
                geoloc = fv;
                break;
            }
            
            fv = subDoc.$ref && subDoc.$ref[k]; 
            if (fv && fv.geoloc) {
                geoloc = fv.geoloc;
                break;
            }
        }

        for (var mf = 0; mf < module.fields.length; mf++) {
            if (module.fields[mf].type == 'geoloc') {
                geolocField = module.fields[mf].name;
                
            }
        }
        
        // metadata treatment
        var meta = subDoc.$meta;
        if (subDoc.$meta) {
            if (subDoc.$meta.created_at) {
                meta.created_at = utilsLib.formatDateTime(subDoc.$meta.created_at);
            }
            if (subDoc.$meta.edited_at) {
                meta.edited_at = utilsLib.formatDateTime(subDoc.$meta.edited_at);
            }
            if (subDoc.$meta.peer) {
                meta.edited_on = subDoc.$meta.peer;
            }
        }
        
        // define outdoc
        var outdoc = {
            _id: subDoc._id,
            _rev: subDoc._rev,
            anchorId: htmlLib.getAnchor(subDoc._id),
            parent_id: parent_id,
            data: [], 
            extradata: [],
            attachments: [],
            modi: subDoc.$modi, 
            modname: /*module.name + ' ' +*/ cacheLib.get_name(app, subDoc.$mm, subDoc.$modi), 
            withattchs: module.withimg || module.withattchs,
            color: module.color,
            module_sons: msons,
            add_sons: !!msons,
            path: pth,
            level: level * 2,
            meta : meta,
            geoloc: geoloc,
            hasGeoloc: !!geoloc
        };
        
        // parse doc following model
        outdoc.label = subDoc.$label;
        outdoc.uid = subDoc._id.split("##")[1];

        // if doc is a synonym
        if (subDoc.$synonym) {
            outdoc.data.push({
                'class': 'validname',
                label: 'Synonym of (valid name)',
                val: synLabels[subDoc.$synonym],
                refid: subDoc.$synonym
            });
        }
        

        function add_line(subDoc, outdoc, label, key, type, extra) {

            label = label || key; // in case of empty label
            var val = subDoc[key], line;

            var hasVal = utilsLib.isNotEmpty(val, type);
            if (hasVal) {
                val = utilsLib.escape(val);
                val = utilsLib.formatFieldValue(val, type); // fancy display

                line = {
                    key: key,
                    label: label,
                    val: val,
                };
            
                // add ref data
                if (subDoc.$ref && subDoc.$ref[key]) {
                    var tooltip = [];
                    for (refmodi in subDoc.$ref[key]) {
                        if (refmodi === '_id') {
                            line.refid = subDoc.$ref[key]._id;
                            continue;
                        }
                        tooltip.push(subDoc.$ref[key][refmodi]);
                    }
                    line.tooltip = tooltip;
                }
                line.has_tooltip = line.tooltip && line.tooltip.length;
                
                if (!extra) {
                    outdoc.data.push(line);
                } else {
                    outdoc.extradata.push(line);
                }
            }
        }

        // add mm fields
        var added_fields = {};

        for (var f = 0; f < module.fields.length; f++) {
            var label = module.fields[f].label,
            type = module.fields[f].type,
            key = module.fields[f].name;

            added_fields[key] = true; // to know what field has been added
            add_line(subDoc, outdoc, label, key, type);
        }

        // add extra fields
        outdoc.hasextra = false;

        for (var key in subDoc) {
            if (key[0] === '_' || key[0] === '$' || added_fields[key]) { continue; }
            outdoc.hasextra = true;
            add_line(subDoc, outdoc, key, key, null, true);
        }

        // include attachments
        for (var a in subDoc.$attachments) {
            var attachment = subDoc.$attachments[a];
            var url = attachment.url;
            outdoc.attachments.push({
                name: a, 
                img_url: url,
                url: url
            });
        }

        for (a in subDoc._attachments) {
            var url = app.db.uri + $.couch.encodeDocId(subDoc._id) + '/' + a,
            at = subDoc._attachments[a];
            outdoc.attachments.push({
                name: a,
                img_url: at.content_type.match('image.*') ? url : 'img/icons/big-attachment.png',
                is_image: at.content_type.match('image.*') ? true : false,
                url: url,
                fn: a,
                shortFn: utilsLib.shorten(a, 17) //cracra
            });
        }

        outdoc.has_attachment = outdoc.attachments.length;
        docs.push(outdoc);
    }

    // sort by path
    docs.sort(function(a,b) {
        //$.log(a.path, b.path);
        return a.path < b.path ? -1 : 1;
    });

    return {
        id: id,
        rev: subDocs[id]._rev,
        mm_id: mm._id,
        mm_key: mm._id.replace('_design/', ''),
        mm_name: mm.name,
        docs: docs,
        isRef: mm.isref,
        is_writer: isWriter
    };
};