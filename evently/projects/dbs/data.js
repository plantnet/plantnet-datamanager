function(dbs, userCtx) {
    var app = $$(this).app;
        app.data.userCtx = userCtx,
        roles = userCtx.roles;

    var admin = userCtx.roles.indexOf('_admin') >= 0,
        hasCreateDbRole = (admin || userCtx.roles.indexOf('createdb') >= 0),
        hasDropDbRole = (admin || userCtx.roles.indexOf('dropdb') >= 0),
        adminRightExist = false,
        needToUpdate = false;

    // TODO : vérifier que c'est le bon endroit pour placer l'affection du role de l'utilisateur pour une base 
    for (var i = 0; i < dbs.length; i++) {
        var db = dbs[i], 
            dbName = db.name;

        db.sessionUserRights = '';

        for (var j = 0; j < roles.length; j++) {
            var role = roles[j],
                prefixDbRole = dbName + '.';
            if (role.indexOf(prefixDbRole) == 0) {
                db.sessionUserRights = role.substring(prefixDbRole.length);
            }
        }

        db.hasAdminRight = (admin | db.sessionUserRights == 'admin');
        if (db.hasAdminRight == true && adminRightExist == false) {
            adminRightExist = true;
        }

        db.dropRight = (db.hasAdminRight && hasDropDbRole);

        if (db.update == true && needToUpdate == false) {
            needToUpdate = true;
        }
    }
   
    return {
        localhost: window.location.host,
        app_path: app.design.code_path,
        dbs: dbs,
        has_dbs: !!dbs.length,
        logged: !!userCtx.name || admin,
        not_logged: !userCtx.name && !admin,
        create_db: hasCreateDbRole,
        drop_db_right_exist: hasDropDbRole,
        admin: admin,
        admin_right_exist: adminRightExist,
        need_to_update: needToUpdate
    };
}