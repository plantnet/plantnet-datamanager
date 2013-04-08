function (e) {

    var app = $$(this).app,
        id = $(this).data("id");

    utilsLib.showBusyMsg('Loading the dialog for edit file', 'editFile');
    $('#edit-doc-modal').modal('hide');
    $(this).trigger("editFile", [id, app.data.trigger]);

    return false;
}