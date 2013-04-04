function() {
    var app = $$(this).app,
        utilsLib = app.getlib('utils');
    
    var answer = confirm('Do you want to update the application ?');
    if (answer) {
        $('#dialog-bloc').trigger('busy', ['Updating application...', '']);
        $('#busy-modal').modal('show');
        
        function onSuccess() {
            utilsLib.showSuccess('Software updated.');
          	$('#busy-modal').modal('hide');
        }
    
        function onError(x,y,z) {
            utilsLib.showError('Software could not be updated. See log for more information');
            $.log('ERROR ' + x + ' : ' + y + ' - ' + z);
            $('#busy-modal').modal('hide');
        }
    
        var dbLib = app.getlib('db');
        dbLib.update_app(app.db, onSuccess, onError);
    }
    return false;
}