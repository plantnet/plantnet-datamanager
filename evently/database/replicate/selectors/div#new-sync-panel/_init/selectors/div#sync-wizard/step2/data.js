function(data) {

    var app = $$(this).app,
        userRole = (app.userCtx && app.userCtx.currentDbRole) ? app.userCtx.currentDbRole : null,
        isSuperAdmin = (app.userCtx && app.userCtx.isSuperAdmin) ? app.userCtx.isSuperAdmin : null,
        isAdmin = (isSuperAdmin || userRole == 'admin') ? true : false;

    return {
        isPut: data.direction == 'put',
        isAdmin: isAdmin
    };
}