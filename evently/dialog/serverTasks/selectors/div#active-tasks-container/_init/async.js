function(callback) {
    var app = $$(this).app,
        db = $$(this).app.db;

    $.couch.activeTasks({
        success: callback,
        error: function() {
            //utilsLib.admin_db(db, 'active_tasks', {}, null, callback, function(data) { 
            db.dm_admin(db.name, 'active_tasks', {}, null, function(data) {
                callback(data);
            }, function(data) {
                callback([]);  
            });
        }
    });
}