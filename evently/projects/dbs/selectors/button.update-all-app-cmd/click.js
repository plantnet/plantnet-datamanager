function() {
    var answer = confirm('Do you want to update application for all dbs ?');
    
    if (answer) {
        var app = $$(this).app,
            utilsLib = app.getlib('utils'),
            dbLib = app.getlib('db');
        
        utilsLib.showBusyMsg('Updating apps...', 'app-update-in-all-dbs');
        
        function onSuccess()  {
            utilsLib.hideBusyMsg('app-update-in-all-dbs');
            $.pathbinder.begin();
            utilsLib.showSuccess('All softwares updated.');
        }
        
        function onError(x, y, z) {
            utilsLib.hideBusyMsg('app-update-in-all-dbs');
            utilsLib.showError('ERROR ' + x + ' : ' + y + ' - ' + z);
        }
        
        dbLib.update_all_app(onSuccess, onError);
    }
    return false;
};