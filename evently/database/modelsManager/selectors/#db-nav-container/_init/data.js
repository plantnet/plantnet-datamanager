function(nbDocs) {
    var app = $$(this).app,
        dbName = app.db.name, // app is undefined! WTF ++ ??
        cacheLib = app.getlib('cache'),
        utilsLib = app.getlib('utils'),
        models = [],
        modelTabSelected = (app.infos.model.id) ? app.infos.model.id : null,
        isModelTabSelected = (modelTabSelected) ? true : false,
        activeModelName = '';

    var mms = cacheLib.get_cached_mms(app);

    if (mms) { // new databases have no mms
        for (var i = 0; i < mms.length; i++) {
            var mm = mms[i],
                mmId = utilsLib.encode_design_id(mm._id),
                selected = false;
            
            if (mmId == modelTabSelected) {
                app.infos.model.isRef = mm.isref;
                activeModelName = mm.name;
                selected = true;
            }
    
            models.push({
                mm_id: mmId, // encoded id
                mm_name: mm.name,
                desc: mm.desc,
                is_ref: mm.isref,
                is_selected: selected
            });
        }
    }

    // sort by type (ref or not) then name
    models.sort(function(a, b) {
        // We want Dictionary first, then sort by name
        if (a.is_ref && (! b.is_ref)) {
            return -1;
        } else if ((! a.is_ref) && b.is_ref) {
            return 1;
        } else if ((a.is_ref && b.is_ref) || ((! a.is_ref) && (! b.is_ref))) {
            return (a.mm_name.toLowerCase() < b.mm_name.toLowerCase()) ? -1 : 1;
        }
    });

    return {
        is_model_tab: isModelTabSelected,
        models: models,
        activeModelName: activeModelName,
        activeModelIsRef: app.infos.model.isRef,
        dbName: dbName,
        nbDocs: nbDocs
    };
}