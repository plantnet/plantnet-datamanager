function(cb, e, db_id) {
    var app = $$(this).app,
        dbLib = app.getlib('db');

    dbLib.get_db_links(app.db, function(doc) {
        $.couch.session({
            success: function(r) {
                // filter databases
                dbLib.get_accessible_dbs_fast(r, function(ldbs, model_dbs) {
                    ldbs = ldbs.map(function(e) {
                        return {
                            name: e.name,
                            role: e.role
                        }
                    });
                    cb(db_id, doc.dbs, ldbs);
                });
            }
        });
    });
}