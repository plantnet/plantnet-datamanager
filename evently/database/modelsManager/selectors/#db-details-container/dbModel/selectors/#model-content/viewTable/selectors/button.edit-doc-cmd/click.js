function() {
    var app = $$(this).app,
    utilsLib = app.getlib('utils'),
    ck = $('table.data input.ck:checked');
    
    if (ck.length != 1) {
        utilsLib.showWarning('Please select only one row to edit.')
    } else {
        var idDoc = ck.val(),
            trigger = new app.libs.utils.Trigger(null, null, null, true);
        
        $('#dialog-bloc').trigger('editDoc', [idDoc, null, trigger]);
    }
    return false;
}