function() {
    var app = $$(this).app,
        utilsLib = app.getlib('utils');

    utilsLib.hideBusyMsg('replicate');

    // auto-refresh sync list
    if (app.refreshSyncList) {
        clearInterval(app.refresh-sync-list);
    }
    var delay = 5000;
    app.refreshSyncList = setInterval(function() {
        $('#sync-list-panel').trigger('_init');
    }, delay);
}