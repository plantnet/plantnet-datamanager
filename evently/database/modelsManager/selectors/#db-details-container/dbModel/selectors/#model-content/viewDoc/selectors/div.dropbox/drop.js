function(e) {
    $(this).removeClass('alert-success');
    e.preventDefault();
    var that = this,
        app = $$(this).app,
        utilsLib = app.getlib('utils'),
        files = e.originalEvent.dataTransfer.files,
        _id = $(this).attr('data-id'),
        _rev = $(this).attr('data-rev'),
         dropLabelOriginal = $('.drop-label', this).html();
    
    $(that).addClass('alert-info');
    $(that).find('.drop-label').html('<img src="img/animate/loader.gif"/>Uploading...');
    
    var onError = function(a, b, c) {
        $('.drop-label', $(that)).html(dropLabelOriginal);
        $(that).removeClass('alert-info');
        utilsLib.showError('Cannot upload file :' + a + b + c);
    };
    
    var onSuccess = function () {
        $('.drop-label', $(that)).html(dropLabelOriginal);
        $(that).removeClass('alert-info');
        utilsLib.showSuccess('Attachment saved.');
        $.pathbinder.begin();
    };
    
    var attachLib = app.getlib('attachments');
    attachLib.upload_files(app.db, _id, _rev, files, onSuccess, onError);
    
    return false;
}