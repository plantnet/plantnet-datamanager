function(callback, parentData) {
    var db = $$(this).app.db,
        dbLib = $$(this).app.getlib('db'),
        conflicts = parentData.data.args[1].conflicts;

    dbLib.count_docs(db, {
        success: function(nbdocs) {
            if (conflicts) {
                db.view('datamanager/conflicts', {
                    success: function(conflict_data) {
                        callback(nbdocs, conflict_data, conflicts);
                    }
                });
            } else {
                callback(nbdocs, null, conflicts);
            }
        }
    });


}