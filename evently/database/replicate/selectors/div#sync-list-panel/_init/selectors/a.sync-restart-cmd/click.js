function(e) {
    var structId = $(this).data('id');

    $('#dialog-bloc').trigger('restartSync', [structId]);

    return false;
}