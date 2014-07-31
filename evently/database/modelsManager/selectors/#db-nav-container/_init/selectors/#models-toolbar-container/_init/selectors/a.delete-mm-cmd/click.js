function() {
    // deletes all data for the given structure
    var mmName = $('.nav-tabs li.active ul li.active a').data('mm-name'),
        answer = confirm('Delete data for structure "'+mmName+'" ?');
    if (answer) {
        answer = confirm('Really sure ?');
         if (answer) {
             var app = $$(this).app,
                 mmId = app.infos.model.id,
                 utilsLib = app.libs.utils,
                 mmLib = app.getlib('mm');

             var includeViewsAndQueries = false;

             function onError(errorMsg) {
                 errorMsg = (errorMsg) ? errorMsg : 'Cannot remove data for this structure';
                 utilsLib.showError(errorMsg);
                 utilsLib.hideBusyMsg('deleteMm');
             }

             function onSuccess() {
                 $.pathbinder.go('/db-manager');
                 utilsLib.showSuccess('Removed data succesfully');
                 utilsLib.hideBusyMsg('deleteMm');
             }

             mmId = utilsLib.decode_design_id(mmId);

             utilsLib.showBusyMsg('Deleting data for structure "'+mmName+'"...', 'deleteMm');
             mmLib.delete_mm_docs(app.db, mmId, onSuccess, onError, includeViewsAndQueries);
         }
    }
    return false;
}