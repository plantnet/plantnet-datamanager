function(callback) {
    var app = $$(this).app,
        mmLib = app.getlib('mm'),
        cacheLib = app.getlib('cache');

    var models = cacheLib.get_cached_mms(app),
        remainingTasks = (models ? models.length : 0);

    if (models) {
        for (var i=0, l=models.length; i<l; i++) {
            mmLib.get_docs_count(app, models[i]._id, function(idx) {
                return function(nbDocs) {
                    models[idx].nbDocs = nbDocs;
                    next();
                };
            }(i));
        }
    } else {
        callback([]);
    }

    function next() {
        remainingTasks--;
        if (remainingTasks == 0) {
            callback(models);
        }
    }
}