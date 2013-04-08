function(indocs, mms) {
    var app = $$(this).app,
        utilsLib = app.getlib('utils'),
        docs = [];

    // build view data
    for (var d = 0; d < indocs.length; d++) {
        var doc = indocs[d];
        if (! doc.$mm) {
            continue;
        }
        var module = mms[doc.$mm].modules[doc.$modt];
        if (! module) { // views and queries
            continue;
        }

        // define outdoc
        var outdoc = { 
            _id: doc._id,
            data: [], 
            extradata: [],
            attachments: [],
            modi: doc.$modi, 
            modname: module.name
        };

        // parse doc following model
        var added_fields = {};

        if (module.index_tpl) {
            outdoc.data.push({key: 'Label', val: doc.$label});
        }

        //outdoc.data.push({key: 'synonym of', val: doc.$synonym}); 

        // add mm fields
        for (var f = 0; f < module.fields.length; f++) {
            var key = module.fields[f].name,
                label = module.fields[f].label,
                type = module.fields[f].type,
                line = {
                    key: label ? label : key,
                    val: doc[key] //utilsLib.formatFieldValue(doc[key], type)
                };

            // add ref data
            if (doc.$ref && doc.$ref[key]) {
                var tooltip = [];
                for (refmodi in doc.$ref[key]) {
                    tooltip.push(doc.$ref[key][refmodi]);
                }
                line.tooltip = tooltip;
            }
            line.hastooltip = !! line.tooltip;

            outdoc.data.push(line);
            added_fields[key] = true; // to know what field has been added
        }

        // add non referenced fields
        for (var k in doc) {
            if (k in added_fields || k[0] === '$' || k[0] === '_') {
                continue;
            }
            outdoc.extradata.push({key: k, val: doc[k]});
        } 
        outdoc.hasextra = !! outdoc.extradata.length;

        // include attachments
        for (var a in doc.$attachments) {
            var attachment = doc.$attachments[a],
                url = attachment.url;
	    outdoc.attachments.push({
	        name: a, 
	        img_url: url,
	        url: url});
        }

        for (a in doc._attachments) {
            var url = a;
            url = app.db.uri + $.couch.encodeDocId(doc._id) + '/' + url;
            var at = doc._attachments[a];
            outdoc.attachments.push({
                name: a, 
                img_url: at.content_type.match('image.*') ? url : 'img/attachment.png',
                url: url});
        }
    
        outdoc.has_attachment = outdoc.attachments.length;
        docs.push(outdoc);
    }
    
    // Compare container width
    var width = docs.length * 320;
    
    return {
        width: width,
        docs: docs
    };
}