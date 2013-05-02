function() {
    var utils = $$(this).app.libs.utils;
    
    utils.hideBusyMsg('activeTasks');
    $('#server-tasks-modal').modal({ backdrop: 'static' });
}