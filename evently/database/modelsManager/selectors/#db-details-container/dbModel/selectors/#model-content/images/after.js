function() {
    var app = $$(this).app,
        htmlLib = app.getlib('html');
        utilsLib = app.getlib('utils');

    htmlLib.activateImgViewer('a.preview');
    $('[data-spy="affix"]').affix();
    utilsLib.hideBusyMsg('images');
}