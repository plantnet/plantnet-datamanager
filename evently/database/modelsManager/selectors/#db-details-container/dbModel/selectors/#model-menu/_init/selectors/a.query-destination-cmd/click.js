function(e) {
    var app = $$(this).app,
    utilsLib = app.getlib('utils');

    utilsLib.showBusyMsg('Opening query destination chooser', 'queryDest');

    var queryId = $(this).data('query-id');

    $('#dialog-bloc').trigger('chooseView', queryId);

    return false;
}