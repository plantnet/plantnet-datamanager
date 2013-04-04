function () {
    var app = $$(this).app,
        mm = app.data.mm,
        mmlib = app.getlib('mm'),
        modis = mmlib.get_sorted_modis(mm),
        modts = [];

    for (var m in mm.modules) {
        if (!mm.modules[m]) {
             continue;
        }
        modts.push({modt: m, name: mm.modules[m].name});
    }

    return {
        has_modis: modis.length > 0 ? true : false,
        modis: modis,
        has_modt: modts.length > 0 ? true : false,
        modts: modts
    };
};