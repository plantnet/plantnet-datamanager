function(e) {
    var mode = $('input[name="includedeleted"]:checked').val(),
        wdPanel = $('#sync-mode-help-with-deleted'),
        wodPanel = $('#sync-mode-help-without-deleted');

    if (mode == 'yes') {
        wdPanel.show();
        wodPanel.hide();
    } else {
        wodPanel.show();
        wdPanel.hide();
    }
}