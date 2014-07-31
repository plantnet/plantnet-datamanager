function() {
    var app = $$(this).app,
        utilsLib = app.getlib('utils'),
        mmLib = app.getlib('mm'),
        queryLib = app.getlib('query');

    var askForLabels = 'All structures will be checked. Rebuild all labels too (may be long)?',
        forceRebuildLabels = confirm(askForLabels);

    utilsLib.showBusyMsg('Checking structures...', 'checkingMms');

    // invalidate tree data (labels have a large probability to be regenerated)
    if (app.data && app.data.tree) {
        delete app.data.tree;
    }

    app.data.lock_changes = Date.now() + 5000; // do not execute up_changes for 5sec.

    app.db.dm('check_data', null, null, function() {
        mmLib.get_mms(app.db, function(mms) {
            mms.map(function(e) {
                mmLib.validate_mm(e, app);
            });
            
            app.db.bulkSave({docs: mms}, {
                success: function() {
                    queryLib.triggerLuceneIndex(app.db);
                    
                    utilsLib.hideBusyMsg('checkingMms');
                    
                    mms.asyncForEach(function(mm, next) {
                        utilsLib.showBusyMsg('Updating structure "' + mm.name + '"...', 'updatingMms');
                        
                        app.db.dm('update_mm', {mm: mm._id}, { forceRebuildLabels: forceRebuildLabels }, 
                            function() { // onSucess
                                utilsLib.showSuccess(mm.name + ' : updated');
                                utilsLib.hideBusyMsg('updatingMms');
                                next();
                            }, 
                            function(e) { // onError
                                utilsLib.showError(mm.name + ' : update error ' + JSON.stringify(e));
                                utilsLib.hideBusyMsg('updatingMms');
                                next();
                            }
                        );
                    }, function () {});
                },
                error: function (a,b,c) {
                    utilsLib.hideBusyMsg('checkingMms');
                    utilsLib.showError(a+b+c);
                }
            });
        
        });
    });

    return false;
}