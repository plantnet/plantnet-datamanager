function(callback) {
    var app = $$(this).app,
        replicateLib = app.getlib('replicateng'),
        utilsLib = app.getlib('utils');

    var rep = new replicateLib.Replicator();

    function onError(err) {
        utilsLib.showError('Error retrieving the list of current replications');
        callback();
    }

    // get list of currently running replications
    rep.getAllReplications(function(replications) {
            $.log('replications', replications);
            callback(replications);
        }, onError
    );
}