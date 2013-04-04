function(docs, id, isConflict, origin) {

    var app = $$(this).app,
        utilsLib = app.getlib('utils'),
        cache = app.getlib('cache'),
        fields = {},
        revsTitles = [],
        revs = [],
        status = [{
            is_field_name: true,
            value: 'Status'
        }];

    // Get all fields
    for (var i = docs.length - 1; i >= 0 ; i--) {
        var doc = docs[i];
        
        // Status
        if (doc._deleted) {
            status.push({
                is_field_name: false,
                value: 'deleted'
            });
        } else {
            status.push({
                is_field_name: false, 
                value: isConflict ? 'conflict' : 'ok'
            });
        }
        
        // Get the field
        for (var f in doc) {
            if (f[0] === '$' || f[0] === '_') {
                continue;
            }
            fields[f] = true;
        }
        fields['$meta'] = true;
        
        revs.push(doc._rev);
        
        // title
        revsTitles.push(doc._rev.split('-')[0]);
    }
    
    var rows = [];
    
    // Fill table by row
    for (var field in fields) {
        var mmInfo = fields[field],
            fieldLabel = cache.getFieldLabel(app, mmInfo.mm, mmInfo.modt, field) || field,
            values = [{is_field_name: true, value: fieldLabel}];
        
        for (var j = docs.length - 1; j >= 0 ; j--) {
            var doc = docs[j],
                val = doc[field];
            
            val = utilsLib.formatFieldValue(val, field);
            val = utilsLib.escape(val);
            values.push({is_field_name: false, value: val});
        }
        
        rows.push({values : values});
    }
    
    return {
        id: id,
        revs_titles: revsTitles,
        status: status,
        rows: rows,
        revs: revs,
        is_conflict: isConflict,
        origin: origin || ''
    };
}