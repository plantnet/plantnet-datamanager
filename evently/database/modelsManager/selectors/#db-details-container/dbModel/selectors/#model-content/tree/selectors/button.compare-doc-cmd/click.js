function() {
    var app = $$(this).app,
        utilsLib = app.getlib('utils'),
        treeView = $('ul#root'),
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
        $('#dialog-bloc').trigger('multiDoc', [ids]);
    }
    
    return false;
}