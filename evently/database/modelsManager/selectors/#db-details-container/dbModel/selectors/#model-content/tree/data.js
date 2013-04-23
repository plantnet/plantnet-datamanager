function(mm, treeStructure, q, showSyn) {
    var app = $$(this).app,
        utilsLib = app.getlib('utils'),
        userRole = (app.userCtx && app.userCtx.currentDbRole) ? app.userCtx.currentDbRole : null,
        isSuperAdmin = (app.userCtx && app.userCtx.isSuperAdmin) ? app.userCtx.isSuperAdmin : null,
        isAdmin = (isSuperAdmin || userRole == 'admin') ? true : false,
        isWriter = (userRole == 'writer' || isAdmin) ? true : false;

    app.data.mm = mm;
    app.data.tree = treeStructure;

    var modelEmpty = (utilsLib.objectEmpty(mm.structure));

    return { 
        mm_id: mm._id,
        short_mm_id: mm._id.slice(8),
        mm_name: mm.name,
        isRef: mm.isref,
        modelEmpty: modelEmpty,
        showSyn : showSyn,
        is_admin: isAdmin,
        is_writer: isWriter
    };
}