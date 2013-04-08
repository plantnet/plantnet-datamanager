function() {
    var app = $$(this).app,
    utilsLib = app.getlib('utils'),
    ck = $('.doc-container input.ck:checked');
    
    if (ck.length != 1) {
        utilsLib.showWarning('Please select only one doc to edit');
    } else {
        var id = ck.val();
        ck.attr('checked', false);

        if (id) {
            $('#dialog-bloc').trigger('editSyn', [id]);
        }
    }
    return false;
}

