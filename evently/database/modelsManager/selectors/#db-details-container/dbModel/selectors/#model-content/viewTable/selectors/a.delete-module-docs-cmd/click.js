function(e) {
    var app = $$(this).app,
        cacheLib = app.getlib('cache');

    var mm_id = $(this).data('mm'),
        mod = $(this).data('modi'),
        is_instance = true;
    if (mod[0] == '*') {
        mod = mod.substring(1);
        is_instance = false;
    }

    var structure = cacheLib.get_cached_mm(app, app.infos.model.id);

    $('#dialog-bloc').trigger('confirmDeleteForMod', [{
        mm_id: mm_id,
        mod: mod,
        is_ref: structure.isref,
        is_instance: is_instance
    }]);

    return false;
}