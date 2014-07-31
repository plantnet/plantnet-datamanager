function(e) {
    var app = $$(this).app,
        db = app.db,
        utilsLib = app.getlib('utils'),
        replicateLib = app.getlib('replicateng'),
        fromZero = $('#restart-sync-from-beginning').attr('checked') == 'checked',
        id = e.data.args[1];

    var rep = new replicateLib.Replicator();

    if (confirm('Restart this synchronization' + (fromZero ? ' from the beginning' : '') + '?')) {
        rep.restartReplication(db, id, function() {
            utilsLib.showSuccess('Synchronization restarted');
            $('#sync-list-panel').trigger('_init');
            $('#restart-sync-modal').modal('hide');
        }, function(err) {
            utilsLib.showError('Coud not restart the synchronization: ' + err);
            $('#restart-sync-modal').modal('hide');
        }, fromZero);
    }

    return false;
}