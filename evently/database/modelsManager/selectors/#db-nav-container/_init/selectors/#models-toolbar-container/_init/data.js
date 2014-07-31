function() {
    var app = $$(this).app;

    var infos = app.infos,
        mm_id = infos.model.id,
        cacheLib = app.getlib('cache'),
        utilsLib = app.getlib('utils'),
        modelTabSelected = (infos.model.id) ? infos.model.id : null,
        //viewActive = (infos.model.activeView) ? 'active_' + infos.model.activeView.replace(/-/g, '_') : 'unactive';
        isModelTabSelected = (modelTabSelected) ? true : false,
        isRef = infos.model.isRef,
        readonly = false,
        userRole = (app.userCtx && app.userCtx.currentDbRole) ? app.userCtx.currentDbRole : null,
        isSuperAdmin = (app.userCtx && app.userCtx.isSuperAdmin) ? app.userCtx.isSuperAdmin : null,
        isAdmin = (isSuperAdmin || userRole == 'admin') ? true : false,
        isWriter = (userRole == 'writer' || isAdmin) ? true : false,
        infosMustache = {},
        pathbinderModi = infos.module.instance.id,
        pathbinderModt = infos.module.id,
        filter_id = infos.filter_id,
        addProneModules = [];

    var decoded_id = utilsLib.decode_design_id(mm_id); // helps us guess if it is a mm
    if (decoded_id.substr(0,8) == '_design/') {
        var mm = cacheLib.get_cached_mm(app, decoded_id);
        if (mm) {
            // is this structure readonly?
            if (mm.readonly === true) {
                readonly = true;
            }
            addProneModules = mm.addProneModules;
        }
    } // else OMG it's a view!

    if (pathbinderModt && pathbinderModt[0] == '*') { // sometimes '*n', sometimes 'n'...
        pathbinderModt = pathbinderModt.slice(1);
    }
    if (filter_id) { // if a Query is displayed, forget the modt/modi (views other than table do not support Queries)
        pathbinderModi = null;
        pathbinderModt = null;
    }

    var modToGo,
        goToModt;
    if (pathbinderModi) {
        modToGo = pathbinderModi;
        goToModt = false;
    } else {
        modToGo = pathbinderModt;
        goToModt = true;
    }

    isWriter = (isAdmin || (isWriter && (! readonly)));

    infosMustache = {
        is_admin: isAdmin,
        is_writer: isWriter,
        is_model_tab: isModelTabSelected,
        is_ref: isRef,
        mm_id: mm_id,
        has_model_selected: !!(infos.model.id != ''),
        add_prone_modules: addProneModules,
        modi: pathbinderModi,
        modt: pathbinderModt,
        modToGo: modToGo,
        goToModt: goToModt,
        mmOnly: ((! pathbinderModi) && (! pathbinderModt)),
        activeView: infos.model.activeView
    };

    return infosMustache;
}