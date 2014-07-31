function() {
    var app = $$(this).app,
        utilsLib = app.getlib('utils');

    utilsLib.showBusyMsg('Loading the dialog for show map.', 'showMap');
}