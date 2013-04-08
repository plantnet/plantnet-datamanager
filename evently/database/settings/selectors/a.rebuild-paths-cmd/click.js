function () {
    // rebuild all docs' paths
    var app = $$(this).app,
        utilsLib = app.getlib('utils'),
        cacheLib = app.getlib('cache');

    utilsLib.showBusyMsg('Rebuilding paths...', 'rebuildPaths');

    var mms = cacheLib.get_cached_mms(app),
        tasksToGo = mms.length + 1;

    for (var i=0, l=mms.length; i<l; i++) {
        app.db.dm("rebuild_path", {
            mm: mms[i]._id.slice(8)
        }, null, function(data) {
            next();
        }, function(mmName) {
            return function(err) {
                utilsLib.showError('Error rebuilding paths for structure "' + mmName + '"');
                next();
            };
        }(mms[i].name));
    }
    next();

    function next() {
        tasksToGo--;
        if (tasksToGo == 0) {
            utilsLib.showSuccess('All paths have been rebuilt');
            utilsLib.hideBusyMsg('rebuildPaths');
        }
    }

    return false;
}