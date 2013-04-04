function() {
    var utilsLib = $$(this).app.getlib('utils');
    utilsLib.showBusyMsg('Loading import view...', 'import');
    $$(this).app.data = {};
}