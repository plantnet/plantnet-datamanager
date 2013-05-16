function() {
    var form = $(this),
        app = $$(this).app,
        utilsLib = app.getlib('utils'),
        dbLib = app.getlib('db'),
        name = $('input[name="link-name"]', form).val(),
        host = $('input[name="link-host"]', form).val().toLowerCase(),
        port = $('input[name="link-port"]', form).val(),
        dbname = $('input[name="link-dbname"]', form).val().toLowerCase();

    if (! port) {
        port = 80; // maybe 5984?
    }

    function onError(err) {
        utilsLib.showError('Could not save database links doc');
    }

    function addLink(doc) {
        doc.dbs.push({
            name: name,
            host: host,
            port: port,
            dbname: dbname,
            url: host + '/' + dbname, // compatibility attempt
        });
        app.db.saveDoc(doc, {
            success: function(data) {
                $('#edit-dbs-modal').modal('hide');
                $('#dialog-bloc').trigger('editDbs', [app.data.trigger]);
            },
            error: onError
        });
    }

    dbLib.get_db_links(app.db, function(doc) {
        addLink(doc);
    }, onError);

    return false;
}