function() {
    var app = $$(this).app,
        dbName = app.db.name,
        userRole = app.userCtx.currentDbRole,
        userSuperAdmin = app.userCtx.isSuperAdmin;
    
    return {
        name: app.userCtx.name,
        uri_name: encodeURIComponent(app.userCtx.name),
        auth_db: encodeURIComponent(app.info.authentication_db),
        user_role: userRole,
        is_super_admin: userSuperAdmin
    };
};