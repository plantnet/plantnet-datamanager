function() {
    var form = $(this),
        app = $$(this).app,
        utilsLib = app.getlib('utils'),
        dbLib = app.getlib('db'),
        name = $('input[name="link_name"]', form).val(),
        url = $('input[name="link_url"]', form).val().toLowerCase();

    if (name.length < 1) {
        utilsLib.showError('The link name don\'t be empty.');
    } else if (url.length < 1) {
        utilsLib.showError('The database URL don\'t be empty.');
    } else {
        function addLink(doc) {
            doc.dbs.push({
                name: name,
                url: url
            });
            app.db.saveDoc(doc, {
                success: function(data) {
                    $('#edit-dbs-modal').modal('hide');
                    $('#dialog-bloc').trigger('editDbs', [app.data.trigger]);
                },
                error: function(err) {
                    utilsLib.showError('Could not save database links doc.');
                }
            });
        }
    
        dbLib.get_db_links(app.db, function(doc) {
            addLink(doc);
        }, function(e) {
            utilsLib.showError('Could not save database links doc.');
        });
    }
    return false;
}