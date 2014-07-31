function(e) {
    // edit a query
    var app = $$(this).app,
        utilsLib = app.getlib('utils'),
        queryId = $(this).data('id');

    utilsLib.showBusyMsg('Opening query editor', 'editQuery');

    $('#dialog-bloc').trigger('editQuery', [queryId]);

    return false;
}