function() {
    var app = $$(this).app,
        htmlLib = app.getlib('html');
        utilsLib = app.getlib('utils');

    // reset last clicked checkbox
    app.lastClickedCheckbox = -1;
    app.lastClickedCheckboxState = false;

    htmlLib.activateImgViewer('a.preview');
    utilsLib.hideBusyMsg('viewList');
    $('[data-spy="affix"]').affix();
}