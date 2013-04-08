function() {
    var app = $$(this).app,
        utilsLib = app.getlib('utils'),
        ck = $('table.data .ck:checked');

    if (ck.length != 1) {
        utilsLib.showWarning('Please select only one doc to edit');
    } else {
        var id = ck.val();
        ck.removeAttr('checked');

        if (id) {
            $('#dialog-bloc').trigger('editSyn', [id]);
        }
    }
    return false;
}

