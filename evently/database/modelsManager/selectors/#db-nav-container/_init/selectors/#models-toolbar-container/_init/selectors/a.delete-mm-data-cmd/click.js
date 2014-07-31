function() {
    /*
    // deletes the whole structure, data, queries and views definitions
    var mmName = $('.nav-tabs li.active ul li.active a').data('mm-name'),
        answer = confirm('Delete data and layout for the structure "'+mmName+'" ?');
    if (answer) {
        answer = confirm ('Really sure ?');
         if (answer) {
             var app = $$(this).app,
                 mmId = app.infos.model.id,
                 utilsLib = app.getlib('utils'),
                 mmLib = app.getlib('mm'),
                 dbLib = app.getlib('db');

             function onError(errorMsg) {
                 errorMsg = (errorMsg) ? errorMsg : 'Cannot remove data and layout for this structure';
                 utilsLib.showError(errorMsg);
                 utilsLib.hideBusyMsg('deleteMmData');
             }

             function onSuccess() {
                 $.pathbinder.go('/db-manager');
                 utilsLib.showSuccess('Data and layout for this structure have been removed.');
                 utilsLib.hideBusyMsg('deleteMmData');
             }

             mmId = utilsLib.decode_design_id(mmId);

             utilsLib.showBusyMsg('Deleting data and layout for structure "'+mmName+'"...', 'deleteMmData');
             mmLib.purge_mm_docs(app.db, mmId, function() {
                 dbLib.bruteForceDelete(app.db, mmId, 
                     function(data) { // dirty hack 'cause of living-dead docs
                         onSuccess();
                     },
                     function(e) {
                         onError(e);
                     });
             }, onError);
         }
    }
    return false;
    */
    var mmName = $('.nav-tabs li.active ul li.active a').data('mm-name');

    var app = $$(this).app,
        mmId = app.infos.model.id;

    $('#dialog-bloc').trigger('deleteMmData', [{'mmName': mmName, 'mmId': mmId}]);

    return false;
}