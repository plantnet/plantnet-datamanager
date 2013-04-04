function () {

    var app = $$(this).app,
    htmlLib = app.getlib('html');

    htmlLib.activateImgViewer('a.preview');

    $('#multi-doc-modal').modal('show');
    app.libs.utils.hideBusyMsg('multiDoc');
}