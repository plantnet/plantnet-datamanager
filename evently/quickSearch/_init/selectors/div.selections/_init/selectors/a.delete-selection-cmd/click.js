function() {
    var app = $$(this).app,
        utilsLib = app.getlib('utils'),
        selectionId = $(this).data('id');

    if (selectionId && confirm("Are you sure you want to delete this selection? The documents won't be affected.")) {
        app.db.openDoc(selectionId, {
            success: function(doc) {
                app.db.removeDoc(doc, {
                    success: function() {
                        $('#selections').trigger('_init');
                        utilsLib.showSuccess('Selection deleted');
                    },
                    error: function() {
                        utilsLib.showError('Error while deleting selection: ' + err);
                    }
                });
            },
            error: function(err) {
                utilsLib.showError('Error while reading selection: ' + err);
            }
        });
    }

    return false;
}