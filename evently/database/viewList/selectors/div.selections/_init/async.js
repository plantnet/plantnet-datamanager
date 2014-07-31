function(callback, e) {
    var app = $$(this).app,
        db = app.db,
        isSelection = (e.data.args[2] == 'select'); // cracra

    db.view('datamanager/selections', {
        success: function(selections) {
            callback(selections.rows, isSelection);
        }
    });
}