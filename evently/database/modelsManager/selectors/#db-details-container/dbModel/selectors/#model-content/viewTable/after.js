function(id, name, cols, modi) {
    var app = $$(this).app
        utilsLib = app.getlib('utils'),
        htmlLib = app.getlib('html');

    $('[data-spy="affix"]').affix();
    utilsLib.hideBusyMsg('viewTable');
    htmlLib.activateImgViewer('a.preview');
}