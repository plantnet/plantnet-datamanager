function(e) {
    var app = $$(this).app,
        utilsLib = app.getlib('utils'),
        mm = e.data.args[0],
        refMm = e.data.args[1];

    utilsLib.showBusyMsg('Trying to repair missing links...', 'repairLinks');

    app.db.dm('match_ref_mm', {mm: mm._id, filter: refMm._id}, null, 
        function() { // onSucess
            $.pathbinder.begin(); // refresh
            utilsLib.hideBusyMsg('repairLinks');
            utilsLib.showSuccess('Links updated');
        }, 
        function() { // onError
            utilsLib.hideBusyMsg('repairLinks');
            utilsLib.showError(mm.name + ' : link update error');
        }
    );
    
    return false;
}