function(callback, e, queryId) {
    var app = $$(this).app;

    app.db.openDoc(queryId, {
        success: function(query) {
            app.db.view('datamanager/views_queries', {
                startkey: ['v', query.$mm],
                endkey: ['v', query.$mm, {}],
                success: function(views) {
                    callback(query, views);
                }
            });
        }
    });
}