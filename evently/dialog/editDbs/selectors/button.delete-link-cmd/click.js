function() {
    var answer = confirm ('Delete ?');

    if (answer) {
        var button = $(this),
            app = $$(this).app,
            dbLib = app.getlib('db'),
            name = button.data('link-name');

        dbLib.get_db_links(app.db, function(doc) {
            for (var i = 0; i < doc.dbs.length; i++) {
                if (doc.dbs[i].name == name) {
                    doc.dbs.splice(i, 1);
                }
            }
            app.db.saveDoc(doc, {
                success: function() {
                    $('#edit-dbs-modal').modal('hide');
                    $('#dialog-bloc').trigger('editDbs', [app.data.trigger]);
                }
            });
        });
    }

    return false;
};