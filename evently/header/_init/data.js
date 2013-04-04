function(e, params) {
    var dbName = $$(this).app.db.name;
    
    return {
        db_name: dbName,
        is_start: (dbName == 'datamanager') ? true : false
    };
}