function(e) {
    var app = $$(this).app,
        utilsLib = app.getlib('utils'),
        replicateLib = app.getlib('replicateng'),
        id = $(this).data('id');

    var rep = new replicateLib.Replicator();

    if (confirm('Cancel this synchronization?')) {
        rep.cancelReplication(id, function() {
            utilsLib.showSuccess('Synchronization cancelled');
            $('#sync-list-panel').trigger('_init');
        }, function(err) {
            utilsLib.showError('Coud not cancel the synchronization: ' + err);
        });
    }

    return false;
}