function(e, files) {
    var form = $('#upload_attachment'),
        app = $$(this).app,
        utilsLib = app.libs.utils,
        _id = $('input[name="_id"]', form).val(),
        _rev = $('input[name="_rev"]', form).val();

    var onError = function(a, b, c) {
        $('span.loading', form).remove();
        utilsLib.showError('Cannot upload file :' + a + b + c);
    };

    var onSuccess = function () {
        $('span.loading', form).remove();
        utilsLib.showSuccess('Attachment saved');
        $('#edit-file-modal').modal("hide");
        $.pathbinder.begin(); // reload page

        form.trigger('editFile', [_id, app.data.trigger]);
    };

    form.append('<span class="loading"/><img src="img/animate/loader.gif"/>Uploading...</span>'); 

    var AtLib = app.getlib('attachments');
    AtLib.upload_files(app.db, _id, _rev, files, onSuccess, onError)
};