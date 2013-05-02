function () {

    var app = $$(this).app,
        utilsLib = app.getlib('utils');

    $('#edit-file-modal').modal({ backdrop: 'static' });
    utilsLib.hideBusyMsg('editFile');

    $("input#upload_file", this).focus();
}