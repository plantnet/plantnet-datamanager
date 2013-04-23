function(linkedDocs) {
    var app = $$(this).app,
        cacheLib = app.getlib('cache');

    var ld;
    for (var i=0, l=linkedDocs.length; i<l; i++) {
        ld = linkedDocs[i];
        ld.structname = cacheLib.get_cached_mm(app, ld.$mm).name;
        ld.modname = cacheLib.get_name(app, ld.$mm, ld.$modi);
    }

    return {
        linkedDocs: linkedDocs,
        atLeastOne: (linkedDocs.length > 0)
    };
}