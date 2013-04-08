function() {
    var app = $$(this).app,
        utilsLib = app.getlib('utils'),
        ck = $('input.ck:checked');
    
    if (ck.length < 1) {
        utilsLib.showWarning('Please select one or more doc to edit.')
    } else {
        var ids = [];
        ck.each(function (i, e) {
            ids.push($(e).val());
        });
        
        var trigger = new utilsLib.Trigger(null, null, null, true);
        $('#dialog-bloc').trigger('editMulti', [ids,trigger]);
        
    }
    return false;
}