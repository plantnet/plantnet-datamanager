function(callback, e, mmId) {

    var app = $$(this).app;

    if (mmId && (typeof mmId == 'string')) { // sometimes the _init event is passed as the 2nd arg :-/
        app.db.view('datamanager/views_queries', {
            cache: JSON.stringify(new Date().getTime()),
            startkey: ['v', mmId],
            endkey: ['v', mmId, {}],
            success: function(views) {
                callback(views.rows);
            }
        });
    }
}