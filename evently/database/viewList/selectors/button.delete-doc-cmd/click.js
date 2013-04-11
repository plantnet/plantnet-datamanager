function(e) {
    var $this = $(this),
        ids = [];
    
    $('.doc-list input.ck:checked').each(function() {
        var id = $(this).val();
        if (id) {
            ids.push(id);
        }
    });
    
    if (!ids.length) {
        utilsLib.showWarning('Please select at least one doc');
    } else {
        var answer = confirm('Delete selected docs and subdocs ?');
        if (answer) {
            var app = $$(this).app,
            onError = app.libs.utils.show_err;
            onSuccess = function (delete_ids) {
                $.pathbinder.begin();
            },
            docLib = app.getlib('doc');
            docLib.delete_with_sons(app.db, ids, onSuccess, onError);
        }
    }
    return false;
}