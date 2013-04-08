function() {
    var dbName = $$(this).app.db.name;
    
    return {
        db_name: dbName,
        is_projects_manager: (dbName == 'datamanager') ? true : false
    };
}