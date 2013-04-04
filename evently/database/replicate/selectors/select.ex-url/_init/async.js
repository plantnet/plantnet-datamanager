function(cb, e, db_id) {
    var app = $$(this).app,
        dbLib = app.getlib('db');
    
    dbLib.get_db_links(app.db, function(doc) {
        dbLib.get_accessible_dbs (true, function(ldbs) {
            ldbs = ldbs.map(function(e) {
                return e.name;
            });
            cb(db_id, doc.dbs, ldbs);
        });
    });
}