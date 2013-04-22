function() {
    var app = $$(this).app,
        utilsLib = app.getlib('utils'),
        ck = $('table.data input.ck:checked');

    if (ck.length != 1) {
        utilsLib.showWarning('Please select only one row');
    } else {
        var idDoc = ck.val();
        $('#dialog-bloc').trigger('linkedDocs', [idDoc]);
    }
    return false;
}