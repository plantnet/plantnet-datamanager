function() {
    var answer = confirm ('Delete ?');
    if (answer) {
        var button = $(this),
            app = $$(this).app,
            dbLib = app.getlib('db'),
            name = button.data('link-name'),
            externalLink = button.parents('.ext-link');
    
        dbLib.get_db_links(app.db, function(doc) {
            for (var i = 0; i < doc.dbs.length; i++) {
                if (doc.dbs[i].name == name) {
                    doc.dbs.splice(i, 1);
                }
            }
            app.db.saveDoc(doc, {
                success: function() {
                    externalLink.remove();
                    var externalLinksNumber = $('.ext-link').length;
                    if (externalLinksNumber == 0) {
                        $('#external-links').toggleClass('hide');
                        $('#no-link-info').toggleClass('hide');
                    }
                }
            });
        });
    }

    return false;
};