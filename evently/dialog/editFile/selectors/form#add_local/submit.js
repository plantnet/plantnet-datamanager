function () {
    var fn = $("input#filename", this).val(),
        form = $(this),
        app = $$(this).app,
        _id = $("input[name=_id]", this).val(),
        _rev = $("input[name=_rev]", this).val(),
        utilsLib = app.getlib('utils'),
        AtLib = app.getlib("attachments");

    function onSuccess() {
        $("span.loading", form).remove();
        utilsLib.showSuccess("File added");
        $('#edit-file-modal').modal("hide");
        form.trigger("editFile", [_id, app.data.trigger]);
    }

    function onError(a,b,c) {
        $("span.loading", form).remove();
        utilsLib.showError("Cannot get local file : " + fn);
        $("input#filename", form).val("");
    }

    form.append('<span class="loading"/><img src="img/animate/loader.gif"/>Uploading...</span>'); 

    AtLib.store_local_file(app.db, _id, _rev, fn, onSuccess, onError);
              
    return false;
}