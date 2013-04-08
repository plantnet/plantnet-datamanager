function(callback, e) {
    var app = $$(this).app,
        db = app.db;

    db.view('datamanager/selections', {
        success: function(selections) {
            callback(selections.rows);
        }
    });
}