function (e, mmId, mod) {
    var app = $$(this).app,
        cacheLib = app.getlib('cache'),
        fieldsList = [];

    if (mmId) {
        var mm = cacheLib.get_cached_mm(app, mmId);
        if (mm) {
            var modt = mod;
            if (mod[0] == '.') {
                modt = mod.substr(mod.lastIndexOf('.') + 1);
            }
            var field;
            for (f in mm.modules[modt].fields) {
                field = mm.modules[modt].fields[f];
                if (field.name) {
                    fieldsList.push({
                        type: field.type,
                        name: field.name,
                        label: cacheLib.getFieldLabel(app, mmId, modt, field.name) || field.name // sometimes cache returns ''
                    });
                }
            }
            //$.log('fieldsList', fieldsList);
        }
    }

    return {
        fieldsList: fieldsList
    };
}