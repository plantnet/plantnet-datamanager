function() {
    var app = $$(this).app,
        utilsLib = app.getlib('utils');

    utilsLib.showBusyMsg('Loading the dialog.', 'editMulti');
}