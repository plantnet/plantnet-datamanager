function(callback, e, params) {
    var app = $$(this).app,
        dbId = params.db_id,
        db = app.db,
        mmLib = app.getlib('mm');

    /*mmLib.get_mms(db, function(mms) {
         db.view('datamanager/selections', {
             success: function(selections) {
                 db.view('datamanager/views_queries', {
                     startkey: ['q'],
                     endkey: ['q', {}],
                     success: function(queries) {
                         callback(mms, selections, queries, dbId);
                     }
                 });
             }
         });
    });*/
    callback();
}