function() {
    var app = $$(this).app,
        htmlLib = app.getlib('html');
        utilsLib = app.getlib('utils');

    htmlLib.activateImgViewer('a.preview');
    utilsLib.hideBusyMsg('viewList');
    $('[data-spy="affix"]').affix();
}