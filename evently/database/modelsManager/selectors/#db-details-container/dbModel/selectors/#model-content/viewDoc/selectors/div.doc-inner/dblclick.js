function(e) {
    // Double click on the block while holding Ctrl to trigger edition
    var id = $(this).parent().parent().find('.doc-header input.ck').val();

    if (e.ctrlKey) {
        $('#dialog-bloc').trigger('editDoc', [id, null, null]);
    }
}