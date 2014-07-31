function() {
    var app = $$(this).app,
        utilsLib = app.getlib('utils'),
        ids = [];

    $('.doc-container input.ck:checked').each(function() {
        var id = $(this).val();
        if (id) {
            ids.push(id);
        }
    });
    
    if (!ids.length) {
        utilsLib.showWarning('Please select at least one row');
    } else {
        $('#dialog-bloc').trigger('multiDoc', [ids]);
    }

    return false;
}