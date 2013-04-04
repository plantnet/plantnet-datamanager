function(event) {
    var data = event.data.args[0],
        app = $$(this).app,
        replicateLib = app.getlib('replicate');
    
    $('#confirm-sync-modal').modal('hide');
    
    var replicator = new replicateLib.Replicator(app.db, data.source, data.target);
    replicator.replicate(data.filters, data.selections, data.queries, data.onSuccess, data.onError);
    $('#dialog-bloc').trigger('serverTasks', [replicator]);

    return false;
}