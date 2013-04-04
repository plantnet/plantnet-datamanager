function() {
    var url = $(this).val(),
        type = $('#sync-panel .tab-pane.active').data('sync-type');
    
    if (url) {
        if (url.slice(0,8) === 'local://') {
            $('#' + type + '-db-login').hide();
        } else {
            $('#' + type + '-db-login').show();
        }
    }
}