function(e) {
    var app = $$(this).app,
        db = app.db,
        utilsLib = app.getlib('utils'),
        replicateLib = app.getlib('replicateng'),
        step4Data = e.data.args[1],
        rep = new replicateLib.Replicator();

    var userCtx = {
        name: app.userCtx.name,
        roles: app.userCtx.roles
    };

    //$.log('LAUNCH SYNC !!!', step4Data);
    rep.launchFromWizard(db, step4Data, userCtx, function() {
        utilsLib.showSuccess('Replication launched');
        $.pathbinder.go('/replicate/_');
    }, function(err) {
        utilsLib.showError('Error: ' + err);
    });

    return false;
}