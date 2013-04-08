function (callback, e, params) {
    var app = $$(this).app,
        utilsLib = app.getlib('utils'),
        mmId = utilsLib.decode_design_id(params.mmId),
        refId = utilsLib.decode_design_id(params.refMmId),
        mmLib = app.getlib('mm');
    
    mmLib.get_mms_by_id(app.db, [mmId, refId], function(mms) {
        var mm = mms[mmId],
            mm_ref = mms[refId],
            ref_fields = mmLib.get_ref_fields(mm),
            keys = [];
        
        // build keys
        for (var mmmodt in ref_fields) {
            var modt = mmmodt.split(',')[1];
            
            for (var field in ref_fields[mmmodt]) {
                if (ref_fields[mmmodt][field] === refId) {
                    keys.push([mmId, modt, field]);
                }
            }
        }
        
        app.db.view('datamanager/missingref', {
            keys: keys,
            cache: JSON.stringify(new Date().getTime()),
            success: function(rows) {
                callback(mm, mm_ref, rows.rows);
            }
        });
    });
}