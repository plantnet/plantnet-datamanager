function(e) {
    var app = $$(this).app,
        utilsLib = app.getlib('utils'),
        replicateLib = app.getlib('replicateng'),
        id = $(this).data('id');

    var rep = new replicateLib.Replicator();

    rep.cancelReplication(id, function() {
        
    }, function(err) {
        utilsLib.showError('' );
    });

    return false;
}