function (e) {

    var app = $$(this).app,
        id = $(this).data("id");

    utilsLib.showBusyMsg('Loading the dialog for edit synonyms', 'editSyn');
    $('#edit-doc-modal').modal('hide');
    $(this).trigger("editSyn", [id, app.data.trigger]);

    return false;
}