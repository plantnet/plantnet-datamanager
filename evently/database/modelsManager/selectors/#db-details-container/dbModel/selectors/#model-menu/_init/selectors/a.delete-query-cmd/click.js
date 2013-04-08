function(e) {
    // delete a query
    var queryRow = $(this).parent(),
        queryLink = queryRow.find('a.query-destination-cmd'),
        queryName = queryLink.html().trim(),
        app = $$(this).app,
        utilsLib = app.getlib('utils'),
        docId = $(this).data('id');

    if (confirm('Delete query "' + queryName + '" ?')) {
        if (confirm('Really sure?')) {
            app.db.openDoc(docId, {
                success: function(doc) {
                    app.db.removeDoc(doc, {
                        success : function() {
                            queryRow.remove();
                            utilsLib.showSuccess('Query "' + queryName + '" deleted');
                        },
                        error: function() {
                            utilsLib.showError('Error when deleting query');
                        }
                    });
                }
            });
        }
    }
}