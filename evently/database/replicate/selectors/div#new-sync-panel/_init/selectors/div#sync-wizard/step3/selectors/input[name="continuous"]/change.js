function(e) {
    var mode = $('input[name="continuous"]:checked').val(),
        osPanel = $('#sync-mode-help-one-shot'),
        cPanel = $('#sync-mode-help-continuous');

    if (mode == 'one-shot') {
        osPanel.show();
        cPanel.hide();
    } else {
        cPanel.show();
        osPanel.hide();
    }
}