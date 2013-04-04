function(lastChanges) {
    var utilsLib = $$(this).app.getlib('utils');
    
    var changes = lastChanges.rows.map(function(e) {
        return { 
            id: e.id,
            time: utilsLib.formatDateTime(e.value.time),
            author: e.value.author,
            label: e.value.label
        };
    });

    return {
      changes: changes
    };
}