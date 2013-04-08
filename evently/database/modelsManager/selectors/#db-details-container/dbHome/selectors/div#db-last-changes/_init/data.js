function(lastChanges) {
    var app = $$(this).app,
        utilsLib = app.getlib('utils'),
        cacheLib = app.getlib('cache');

    var changes = lastChanges.rows.map(function(e) {
        return { 
            id: e.id,
            time: utilsLib.formatDateTime(e.value.time),
            author: e.value.author,
            label: e.value.label,
            structname: (e.value.mmId ? cacheLib.get_cached_mm(app, e.value.mmId).name : ''),
            modname: (e.value.modi ? cacheLib.get_name(app, e.value.mmId, e.value.modi) : 'special doc')
        };
    });

    return {
      changes: changes
    };
}