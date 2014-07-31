function(callback) {
    var app = $$(this).app,
        db = app.db,
        replicateLib = app.getlib('replicateng'),
        utilsLib = app.getlib('utils');

    var rep = new replicateLib.Replicator();

    function onError(err) {
        utilsLib.showError('Error retrieving the list of current replications');
        callback();
    }

    // get list of currently running replications
    rep.getAllReplications(db, function(replications) {
            callback(replications);
        }, onError
    );
}