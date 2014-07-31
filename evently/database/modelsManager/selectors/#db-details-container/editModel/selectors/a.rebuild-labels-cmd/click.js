function(e) {
    var app = $$(this).app,
        utilsLib = app.getlib('utils'),
        structId = $(this).data('structid');

    var msg = 'Rebuild all labels? This may take some time.';

    if (! confirm(msg)) {
        return false;
    }

    utilsLib.showBusyMsg('Regenerating labels...', 'updatingMm');

    app.db.dm('update_mm', {mm: structId }, { forceRebuildLabels: true }, 
        function() { // onSucess
            utilsLib.showSuccess('Structure updated');
            utilsLib.hideBusyMsg('updatingMm');
        }, 
        function(e) { // onError
            utilsLib.showError('Update error: ' + JSON.stringify(e));
            utilsLib.hideBusyMsg('updatingMm');
        }
    );
}