function () {
    var id = $(this).attr("href").slice(1),
        app = $$(this).app,
        utilsLib = app.getlib('utils');

    var activeid = $(this).closest("form").find("input[name=syn]:checked").attr("id");

    function onSuccess() {
        $.log(activeid);
        $('#edit-syn-modal').modal("hide");
        $("#dialog-bloc").trigger("editSyn", [activeid, app.data.trigger]);
        utilsLib.showSuccess('Synonym removed');
    }

    function onError(a,b,c) {
        utilsLib.showError(a + b + c);
    }

    app.db.update("datamanager/synonym", id, null, onSuccess, onError);

    return false;
}