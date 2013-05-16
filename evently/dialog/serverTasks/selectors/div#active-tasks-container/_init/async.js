function(callback) {
    var app = $$(this).app,
        db = $$(this).app.db,
        utilsLib = app.getlib('utils');
    
    $.couch.activeTasks({
      success: callback,
      error: function() {
          utilsLib.admin_db(db, 'active_tasks', {}, null, callback, function(data) { 
              callback([]); 
              $.log(data); 
          });
      }
    });
}