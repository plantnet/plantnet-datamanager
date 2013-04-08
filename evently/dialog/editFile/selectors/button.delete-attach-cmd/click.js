function() {

    var answer = confirm ("Delete ?");
    if(!answer) {
        return false;
    }

    var app = $$(this).app,
        utilsLib = app.getlib('utils'),
        docLib = app.getlib('doc'),
        key = $(this).attr('id'),
        doc_id = $(this).data('id'),
        doc_rev = $(this).data('rev'),
        embedded = $(this).data('em');

    var onSuccess = function () {
        utilsLib.showSuccess('Attachment deleted');
        $('#edit-file-modal').modal("hide");
        $.pathbinder.begin(); // reload page
        $('#edit-file-modal').trigger("editFile", [doc_id, app.data.trigger]);
    };

    var onError = function (e) {
        utilsLib.showError(e);
    };

    docLib.delete_attachment(app.db, doc_id, doc_rev, key, embedded, onSuccess, onError);

    return false;
}