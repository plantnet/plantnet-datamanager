function(mm, viewsAndQueries, mmLib, app) {

    var dataMustache = {};
    var userRole = (app.userCtx && app.userCtx.currentDbRole) ? app.userCtx.currentDbRole : null,
        isSuperAdmin = (app.userCtx && app.userCtx.isSuperAdmin) ? app.userCtx.isSuperAdmin : null,
        isAdmin = (isSuperAdmin || userRole == 'admin') ? true : false,
        isWriter = (userRole == 'writer' || isAdmin) ? true : false,
        infos = app.infos,
        cacheLib = app.getlib('cache'),
        pathbinderModi = infos.module.instance.id,
        pathbinderModt = infos.module.id,
        filter_id = infos.filter_id,
        viewId = infos.view.id;

    if (pathbinderModt && pathbinderModt[0] == '*') { // viewTable uses '*n' but images uses 'n'
        pathbinderModt = pathbinderModt.slice(1);
    }

    if (mm == null)  {
        dataMustache = {
            has_menu : false
        };
    } else {
        var utilsLib = app.getlib('utils'),
            mmId = utilsLib.encode_design_id(mm._id),
            modules = [],
            spActions = [],
            readonly = false,
            structure = mmLib.get_sorted_modis(mm);

        // is this structure readonly?
        if (mm.readonly === true) {
            readonly = true;
        }
        var mayWrite = (isAdmin || (isWriter && (! readonly)));

        for (var m in mm.modules) {
            mm.modules[m].mm_id = mmId;
            mm.modules[m].modt = m;
            mm.modules[m].active = ((m == pathbinderModt) && (! pathbinderModi));
            modules.push(mm.modules[m]);
        }

        for (var actionKey in mm.specific_action) {
            var action = mm.specific_action[actionKey];
            spActions.push({
                name: action.name,
                key: actionKey
            });
        }

        // add special fields
        structure.map(function(e) {
            var d = mm.modules[e.modt].desc;
            e.shortLabel = e.title ? e.title : e.name;
            e.longLabel = cacheLib.get_name(app, mm._id, e.modi);
            e.desc = d ? d : '';
            e.add = e.may_create;
            e.del = e.noson;
            e.mm_id = mmId; // encoded id
            if (e.modi == pathbinderModi) {
                app.infos.module.instance.addDocPossible = e.may_create;
                e.active = (! filter_id);
            } else {
                e.active = false;
            }
        });

        var views = [],
            queries = [];
        viewsAndQueries.views.rows.map(function(e) {
            views.push({
                id: e.id,
                name: e.value.name,
                active: (viewId == e.id)
            });
        });
        viewsAndQueries.queries.rows.map(function(e) {
            queries.push({
                id: e.id,
                name: e.value.name,
                active: (filter_id == e.id),
                //modi: e
            });
        });

        dataMustache = {
            has_menu : true,
            modules: modules,
            structure: structure,
            desc: mm.desc,
            mmname: mm.name, 
            isref: mm.isref,
            isnotref: (!mm.isref),
            mm_id: mmId, // encoded id
            views: views,
            hasViews: views.length,
            queries: queries,
            hasQueries: queries.length,
            inStructure: (pathbinderModi && ! viewId && ! filter_id),
            inModules: ((pathbinderModt && ! pathbinderModi) && ! filter_id && ! viewId),
            inViews: viewId,
            inQueries: (filter_id),
            specific_actions : spActions,
            has_specific_actions : !!(spActions.length),
            is_admin: isAdmin,
            //is_writer: isWriter
            is_writer: mayWrite
        };
    }

    //$('#db-nav-container').trigger('_init'); // reload toolbar for "add" button

    return dataMustache;
}