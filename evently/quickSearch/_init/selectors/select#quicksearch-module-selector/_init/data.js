function (e, mmId) {
    var app = $$(this).app,
        cacheLib = app.getlib('cache'),
        modiList = [],
        modtList = [];

    if (mmId) {
        var mm = cacheLib.get_cached_mm(app, mmId);
        if (mm) {
            for (modi in mm.structure) {
                modiList.push({
                    id: modi,
                    name: cacheLib.get_name(app, mmId, modi)
                });
            }
            for (modt in mm.modules) {
                modtList.push({
                    id: modt,
                    name: mm.modules[modt].name
                });
            }
        }
    }

    return {
        modiList: modiList,
        modtList: modtList
    };
}