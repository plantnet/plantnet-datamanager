function() {
    var app = $$(this).app,
        utilsLib = app.getlib('utils');
    
    if ($('table.data input.ck:checked').length != 1) {
        utilsLib.showWarning('Please select only one row to see the details.')
    } else {
        var idDoc = $('table.data input.ck:checked').val();
        $.pathbinder.go('/viewdoc/' + idDoc);
    }
}