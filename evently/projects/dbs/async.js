function(callback) {
    var dbLib = $$(this).app.getlib('db');

    $.couch.session({
        success: function(r) {
            // filter databases
            dbLib.get_accessible_dbs_fast(r, function(dbs, model_dbs) {
                callback(dbs, r.userCtx); });
        }
    });
}