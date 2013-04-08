function(e) {
    var app = $$(this).app,
        utilsLib = app.getlib('utils'),
        ids = [];

    $('table.data .ck:checked').each(function() {
        var id = $(this).val();
        if (id) {
            ids.push(id);
        }
    });

    if (ids.length > 0) {
        var plural = (ids.length > 1) ? true : false,
            confirmStr = 'Delete ' + (plural ? '' : 'the ') + 'selected doc' + (plural ? 's' : '') + ' and sub-docs ?';
            answer = confirm(confirmStr);
        if (answer) {
            var docLib = app.getlib('doc'),
                onError = utilsLib.showError;
        
            var onSuccess = function(deleteIds) {
                $.pathbinder.go($.pathbinder.currentPath().slice(1));
                var successStr = 'The selected doc'+ (plural ? 's' : '') +' and sub-docs have been deleted';
                utilsLib.showSuccess(successStr);
            };
            
            docLib.delete_with_sons(app.db, ids, onSuccess, onError);
        }
    } else {
        utilsLib.showWarning('Please select at least one row');
    }
    return false;
}