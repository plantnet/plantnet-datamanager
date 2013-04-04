function(callback, e) {
    var app = $$(this).app;
    app.db.view('datamanager/last_changes', {
        limit: 100,
        descending: true,
        success: callback
    });
}