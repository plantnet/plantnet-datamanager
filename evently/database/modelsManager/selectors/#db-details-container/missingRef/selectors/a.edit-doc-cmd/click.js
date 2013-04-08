function() {
    var app = $$(this).app,
        utilsLib = app.getlib('utils'),
        id = $(this).attr('data-id');
    
    if (id) {
        var trigger = new utilsLib.Trigger(null, null, null, true);
        $('#dialog-bloc').trigger('editDoc', [id, null, trigger]);
    }
    
    return false;
}