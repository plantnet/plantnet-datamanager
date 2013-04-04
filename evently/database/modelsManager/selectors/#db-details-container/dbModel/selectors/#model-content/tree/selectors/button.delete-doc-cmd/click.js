function() {
    var app = $$(this).app,
        utilsLib = app.getlib('utils'),
        docLib = app.getlib('doc'),
        treeViewLib = app.getlib('treeview'),
        treeView = $('ul#root'),
        ts = app.data.tree,
        ids = [];

    $('input[type=checkbox]:checked', treeView).each(function() {
        var id = $(this).val();
        if (id) {
            ids.push(id);
        }
    });
    
    if (!ids.length) {
        utilsLib.showWarning('Please select at least one node.');
    } else {
        var answer = confirm ('Delete selected doc and subdocs ?');
        if (answer) {
            var onError = utilsLib.showError;
            var onSuccess = function (delete_ids) {
                utilsLib.showSuccess('Doc and sons have been deleted.');

                // tree update is automatique
                //treeViewLib.remove(ts, ids);
                //treeView.trigger('_init');
            };
            docLib.delete_with_sons(app.db, ids, onSuccess, onError);
        }
    }

    return false;
}