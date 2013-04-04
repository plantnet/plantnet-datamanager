function () {

    var form = $(this);
    var app = $$(this).app;
    var url = form.find("input[type=url]").val();
    if(!url || !url.length) {
	 return false;
    }

    var _id = form.find("input[name=_id]").val();

    var onError = function(a, b, c) {
        $("span.loading", form).remove();
        app.libs.utils.show_err("Cannot add link :" + a + b + c);
    };

    var onSuccess = function () {
        $("span.loading", form).remove();
        $('#edit-file-modal').modal("hide");
        form.trigger("editFile", [_id, app.data.trigger]);
    };

    form.append('<span class="loading"/><img src="img/animate/loader.gif"/>Uploading...</span>'); 
    var doc_lib = app.require("vendor/datamanager/lib/doc");
    doc_lib.add_url_attachment(app.db, _id, url, onSuccess, onError);

    return false;

}