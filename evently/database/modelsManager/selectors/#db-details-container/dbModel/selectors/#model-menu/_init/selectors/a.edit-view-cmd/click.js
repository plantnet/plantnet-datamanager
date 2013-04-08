function(e) {
    // edit a view
    var app = $$(this).app,
        utilsLib = app.getlib('utils'),
        viewId = $(this).data('id');

    utilsLib.showBusyMsg('Opening view editor', 'editView');

    $('#dialog-bloc').trigger('editView', [viewId]);

    return false;
}