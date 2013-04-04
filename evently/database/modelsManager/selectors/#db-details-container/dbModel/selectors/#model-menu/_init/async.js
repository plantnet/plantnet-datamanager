function(callback) {
    var app = $$(this).app,
        db = app.db,
        mmLib = app.getlib('mm'),
        utilsLib = app.getlib('utils'),
        cacheLib = app.getlib('cache'),
        viewsQueries = {},
        mm = null,
        mmId = utilsLib.decode_design_id(app.infos.model.id);

    mm = cacheLib.get_cached_mm(app, mmId);

    if (mm) {
        // get views
        db.view('datamanager/views_queries', {
            cache: JSON.stringify(new Date().getTime()),
            startkey: ['v', mmId],
            endkey: ['v', mmId, {}],
            success: function(views) {
                viewsQueries.views = views;
                // get queries
                db.view('datamanager/views_queries', {
                    cache: JSON.stringify(new Date().getTime()),
                    startkey: ['q', mmId],
                    endkey: ['q', mmId, {}],
                    success: function(queries) {
                        viewsQueries.queries = queries;
                        readyToCallback();
                    }
                });
            }
        });
    } else {
        readyToCallback();
    }

    function readyToCallback() {
        callback(mm, viewsQueries, mmLib);
    }
}