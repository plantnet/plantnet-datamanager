function(callback, e, id) {
    var app = $$(this).app,
        time = JSON.stringify(new Date().getTime());

    app.db.view('datamanager/refs', {
        cache: time,
        startkey : id,
        endkey: id,
        include_docs: true,
        success: function(refData) {
            var docs = [];
            docs = refData.rows.map(function(row) {
                return row.doc;
            });
            callback(docs);
        }, error: function() {
            utilsLib.showError('Error while retrieving linked docs');
            callback([]);
        }
    });
}