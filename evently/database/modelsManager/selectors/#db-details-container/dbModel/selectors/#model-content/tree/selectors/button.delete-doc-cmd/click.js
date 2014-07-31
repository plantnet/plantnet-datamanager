function() {
    var app = $$(this).app,
        utilsLib = app.getlib('utils'),
        structure = app.data.mm,
        treeView = $('ul#root'),
        ids = [];

    $('input.ck[value!=""]:checked', treeView).each(function() {
        var id = $(this).val();
        if (id) {
            ids.push(id);
        }
    });
    
    if (!ids.length) {
        utilsLib.showWarning('Please select at least one node.');
    } else {
        $('#dialog-bloc').trigger('confirmDelete', [{
            ids: ids,
            isRef: structure.isref
        }]);
    }

    return false;
}