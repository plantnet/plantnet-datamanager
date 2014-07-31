function(callback) {
    var app = $$(this).app,
        utilsLib = app.getlib('utils');

    var qs_doc_id = '_local/quick_search';
    app.db.openDoc(qs_doc_id, {
        success: function(doc) {
            callback(doc);
        },
        error: function() {
            utilsLib.hideBusyMsg('showQSQueries');
        }
    });
}