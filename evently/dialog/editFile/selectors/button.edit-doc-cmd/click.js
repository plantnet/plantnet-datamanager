function () {
    var id = $(this).data('id');
    $('#edit-file-modal').modal("hide");
    $("#dialog-bloc").trigger("editDoc", [id, null, $$(this).app.data.trigger]);
    return false;
}