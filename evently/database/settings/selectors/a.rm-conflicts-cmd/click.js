function () {
    var app = $$(this).app,
    utilsLib = app.getlib('utils'),
    mmLib = app.getlib('mm');

    var resolve_function = 'resolve_all_conflict';
    var by_date = false;
    var question = 'Resolve all conflicts (by revision number) without verification. Continue ?';

    if($(this).hasClass('resolve_conflicts_by_date')){
      resolve_function = 'resolve_all_conflict_by_date';
      by_date = true;
      question = 'Resolve all conflicts (by date) without verification. Continue ?';
    }
    
    var answer = confirm (question);
    if (!answer) { return false; }
    
    utilsLib.showBusyMsg('Resolving conflict...', 'resolveConflict');

    app.db.dm(resolve_function, {}, null, 
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