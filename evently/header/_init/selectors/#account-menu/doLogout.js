function() {
    var elem = $(this),
        utilsLib = $$(this).app.getlib('utils');
    
    $.couch.logout({
        success: function() {
            var dbname = 'datamanager';
            window.location = '/' + dbname + '/_design/datamanager/projects.html';
            utilsLib.showSuccess('You have been disconnected.');
        }
    });
    return false;
};