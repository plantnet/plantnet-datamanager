function () {
    var answer = confirm('Do you want to update the application ? It can be long (indexation).');
 
    if (answer) {
        var app = $$(this).app,
            utilsLib = app.libs.utils,
            dbLib = app.getlib('db'),
            dbName = $(this).attr('data-db-name'),
            parent = $(this).closest('td'),
            that = this;
        
        parent.append('<img src="img/animate/loader.gif"/>');
        
        function onSuccess()  {
            $('img', parent).remove();
            $(that).remove();
            $.pathbinder.begin();
            utilsLib.showSuccess('Software updated.');
        }
    
        function onError(x,y,z) {
            $('img', parent).remove();
            utilsLib.showError('ERROR ' + x + ' : ' + y + ' - ' + z);
        }
        
        dbLib.update_app($.couch.db(dbName), onSuccess, onError);
    }
    return false;
}