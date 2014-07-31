function () {

    var app = $$(this).app,
    htmlLib = app.getlib('html');

    htmlLib.activateImgViewer('a.preview');

    $('#multi-doc-modal').modal({ backdrop: 'static' });
    app.libs.utils.hideBusyMsg('multiDoc');
}