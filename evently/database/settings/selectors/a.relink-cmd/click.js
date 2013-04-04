function() {
    var app = $$(this).app,
        utilsLib = app.getlib('utils'),
        mmLib = app.getlib('mm');

    utilsLib.showBusyMsg('Relinking in progress...', 'relinkingData');

    mmLib.get_mms(app.db, function(mms) {
        utilsLib.hideBusyMsg('relinkingData');
        
        mms.forEach(function(mm) {
            utilsLib.showBusyMsg('Relinking data for structure "'+ mm.name +'" in progress...', 'relinkingMmData' + mm.name);

            app.db.dm('match_ref_mm', {mm: mm._id}, null, 
                function() { // onSucess
                    utilsLib.showSuccess(mm.name + ' : data relinked');
                    utilsLib.hideBusyMsg('relinkingMmData' + mm.name);
                }, 
                function() { // onError
                    utilsLib.showError(mm.name + ' : relink data error');
                    utilsLib.hideBusyMsg('relinkingMmData' + mm.name);
                }
            );
        });
    });
    
    return false;
}