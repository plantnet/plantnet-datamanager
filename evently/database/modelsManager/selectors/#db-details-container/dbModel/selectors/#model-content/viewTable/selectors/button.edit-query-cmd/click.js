function(e) {
    var app = $$(this).app, 
        queryId = $(this).attr('data-query-id');

    $('#dialog-bloc').trigger('editQuery', [queryId]);
    
    return false;
}