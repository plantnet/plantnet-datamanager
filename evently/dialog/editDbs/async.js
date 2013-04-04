function(callback, e, trigger){
    var app = $$(this).app,
        dbLib = app.getlib('db');
    
    app.data.trigger = trigger;
    
    dbLib.get_db_links(app.db, function(doc) {
        callback(doc.dbs);
    });
};