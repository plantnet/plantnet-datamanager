function (e) {

    var app = $$(this).app,
        utilsLib = app.getlib('utils'),
        active,
        ids = [];

    $("input[name=syn]", this).each(function () {
        var id = $(this).attr("id");
        if($(this).attr("checked")) {
            active = id;
        } else {
            ids.push(id);
        }
    });

    function onSuccess() {
        $('#edit-syn-modal').modal("hide");
        $("#dialog-bloc").trigger("editSyn", [active, app.data.trigger]);
        utilsLib.showSuccess('Valid name updated');
    }

    function onError (e,a,b,c) {
        utilsLib.showError(e);
    }

    var doclib = app.getlib("doc");
    doclib.set_active_synonym(app.db, active, ids, onSuccess, onError);

    return false;
}