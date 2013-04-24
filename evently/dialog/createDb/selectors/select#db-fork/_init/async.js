function (callback) {
    var app = $$(this).app,
    db = app.getlib("db");
    db = db.get_accessible_dbs(true, callback);
}