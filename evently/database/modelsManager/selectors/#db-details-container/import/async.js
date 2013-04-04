function(callback, e, params) {
    var app = $$(this).app,
        utilsLib = app.getlib('utils'),
        mmId = utilsLib.decode_design_id(params.mmId);

    app.db.openDoc(mmId, {
        success: function(mm) {
            callback(mm);
        }
    });
}