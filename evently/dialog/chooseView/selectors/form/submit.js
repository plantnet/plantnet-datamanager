function() {
    var queryId = $('input[name="query_id"]', this).val(),
        radio = $('input[name="type"]:checked', this),
        mmId = radio.val(),
        type = radio.data('type'),
        viewId = $('select[name="view_id"] option:checked', this).val();

    if (type === 'list') {
        $.pathbinder.go('/viewlist/query/' + queryId + '/0/0/0');
    } else if (type === 'table') {
        $.pathbinder.go('/viewtable/' + mmId + '/_id/0/0/' + queryId + '/0/0/1');
    } else if (type === 'view') {
        $.pathbinder.go('/viewtable/' + viewId + '/0/_id/0/0/' + queryId + '/0/0/1');
    }
    
    $('#choose-view-modal').modal('hide');
    return false;
}