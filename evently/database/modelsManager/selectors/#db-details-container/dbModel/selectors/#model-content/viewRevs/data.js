function(docs, id, isConflict, origin, isDdoc) {

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
    // Sort by _rev asc
    docs = docs.sort(function(a, b) {
        if(a._rev < b._rev) {
            return -1;
        }
        return 1;
    });
    // First doc (highest _rev) is checked by default
    var checked=true;

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
        
        revs.push({rev: doc._rev, checked: checked});

        if(checked) {
            checked = false;
        }
        
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