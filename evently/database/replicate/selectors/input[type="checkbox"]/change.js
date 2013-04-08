function() {
    // selected items are displayed in bold
    var syncType = $('#sync-panel .tab-pane.active').data('sync-type'),
        id = $(this).attr('id');
    
    // check/uncheck all
    if (id == 'ex-all') {
        $('input[type="checkbox"]').each(function() {
            if ($(this).attr('id') != 'ex-all') {
                $(this).attr('checked', false).parent('label').removeClass('selected');
            }
        });
    } else {
        $('#ex-all').attr('checked', false).parent('label').removeClass('selected');
    }
    
    // Add/Remove selected to label for current element checked 
    $(this).parent('label').toggleClass('selected');
}