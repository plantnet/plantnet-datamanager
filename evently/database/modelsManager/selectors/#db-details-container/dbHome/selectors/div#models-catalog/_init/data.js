function(models) {
    var app = $$(this).app
        userRole = (app.userCtx && app.userCtx.currentDbRole) ? app.userCtx.currentDbRole : null,
        isSuperAdmin = (app.userCtx && app.userCtx.isSuperAdmin) ? app.userCtx.isSuperAdmin : null,
        isAdmin = (isSuperAdmin || userRole == 'admin') ? true : false;

    for (var i=0, l=models.length; i<l; i++) {
        models[i].id = models[i]._id.slice(8);
    }

    // dictionaries first, then by name
    models.sort(function(a, b) {
        if (a.isref) {
            if (b.isref) {
                return (a.name.toLowerCase() > b.name.toLowerCase()) ? 1 : -1;
            } else {
                return -1;
            }
        } else {
            if (b.isref) {
                return 1;
            } else {
                return (a.name.toLowerCase() > b.name.toLowerCase()) ? 1 : -1;
            }
        }
    });

    return {
        models: models,
        hasModels: models.length,
        is_admin: isAdmin
    };
}