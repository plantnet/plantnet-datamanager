function() {
    var app = $$(this).app,
    utilsLib = app.getlib('utils');

    utilsLib.hideBusyMsg('queryDest');

    $('#choose-view-modal').modal('show');
}