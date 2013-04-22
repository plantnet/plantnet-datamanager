function(e) {
    var id = $(this).data('id');

    $.pathbinder.go('/viewdoc/' + id);
    $('#linked-docs-modal').modal('hide');

    return false;
}