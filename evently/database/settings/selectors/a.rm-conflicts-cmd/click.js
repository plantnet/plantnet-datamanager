function () {
    var app = $$(this).app,
    utilsLib = app.getlib('utils'),
    mmLib = app.getlib('mm');
    
    var answer = confirm ('Resolve all conflicts without verification. Continue ?');
    if (!answer) { return false; }
    
    utilsLib.showBusyMsg('Resolving conflict...', 'resolveConflict');
    
    app.db.dm('resolve_all_conflict', {}, null, 
              function() { // onSucess
                  utilsLib.showSuccess('All conflicts removed');
                  utilsLib.hideBusyMsg('resolveConflict');
                  
              }, 
              function(a,b,c) { // onError
                  $.log(a,b,c);
                  utilsLib.showError("Error during conflict resolution");
                  utilsLib.hideBusyMsg('resolveConflict');
                  
              }
             );

    return false;
}