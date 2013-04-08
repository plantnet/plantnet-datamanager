function () {

    var app = $$(this).app,
        utilsLib = app.getlib('utils');

    $('#edit-file-modal').modal('show');
    utilsLib.hideBusyMsg('editFile');

    $("input#upload_file", this).focus();
}