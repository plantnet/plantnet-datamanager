function() {
    var utilsLib = $$(this).app.getlib('utils'),
        ids = [];
    
    $('.doc-list input.ck:checked').each(function() {
        var id = $(this).val();
        if (id) {
            ids.push(id);
        } 
    });
    
    if (!ids.length) {
        utilsLib.showWarning('Please select at least one doc for comparing.');
    } else {
        $('#dialog-bloc').trigger('multiDoc', [ids]);
    }
    return false;
}