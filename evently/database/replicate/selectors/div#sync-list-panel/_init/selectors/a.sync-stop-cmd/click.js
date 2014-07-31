function(e) {
    var app = $$(this).app,
        utilsLib = app.getlib('utils'),
        replicateLib = app.getlib('replicateng'),
        id = $(this).data('id');

    var rep = new replicateLib.Replicator();

    if (confirm('Stop / remove this synchronization?')) {
        rep.cancelReplication(id, function() {
            utilsLib.showSuccess('Synchronization stopped / removed');
            $('#sync-list-panel').trigger('_init');
        }, function(err) {
            utilsLib.showError('Coud not stop / remove the synchronization: ' + err);
        });
    }

    return false;
}