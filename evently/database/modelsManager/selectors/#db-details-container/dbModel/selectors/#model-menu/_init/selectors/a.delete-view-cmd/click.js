function(e) {
    // delete a view
    var viewRow = $(this).parent(),
        viewLink = viewRow.find('a.model-menu-cmd'),
        viewName = viewLink.html().trim(),
        app = $$(this).app,
        utilsLib = app.getlib('utils'),
        docId = $(this).data('id');

    if (confirm('Delete view "' + viewName + '" ?')) {
        if (confirm('Really sure?')) {
            app.db.openDoc(docId, {
                success: function(doc) {
                    app.db.removeDoc(doc, {
                        success : function() {
                            $('#model-menu').trigger('_init');
                            utilsLib.showSuccess('View "' + viewName + '" deleted');
                        },
                        error: function() {
                            utilsLib.showError('Error when deleting view');
                        }
                    });
                }
            });
        }
    }
}