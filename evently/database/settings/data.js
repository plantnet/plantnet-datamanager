function(users, secu, addons, mms, roles, sessionUserName) {
    var userNames = [],
        dbName = $$(this).app.db.name,
        members = secu.members || secu.readers || {},
        isPublic = !members.roles || !members.roles.length,
        sessionUserRole = 'excluded';

    var isSysAdmin = roles.indexOf('_admin') >= 0,
        isDbAdmin = (roles.indexOf(dbName + '.admin') >= 0 || isSysAdmin);

    
    if (users) {
    	var nu = 0;
        userNames = users.rows.map(
            function(e) {
                var id = e.id,
                    name = e.doc.name,
                    displayName = name.toLowerCase(),
                    roles = e.doc.roles,
                    isSessionUser = false,
                    isAdmin = false,
                    isWriter = false,
                    isReader = false,
                    isExclude = true;
                
                if (name == sessionUserName) {
                    isSessionUser = true;
                }
                
                for (var i = 0; i < roles.length; i++) {
                    var roleComplete = roles[i];
                    var haveDbRole = (roleComplete && roleComplete.indexOf(dbName) == 0) ? true : false;

                    if (haveDbRole) {
                        isExclude = false;
                        
                        var positionOfStrRole = roleComplete.indexOf('.', 0) + 1, 
                            role = roleComplete.substring(positionOfStrRole);

                        if (name == sessionUserName) {
                            sessionUserRole = role;
                        }
                        
                        switch (role) {
                            case 'admin' :
                                isAdmin = true;
                                break;
                            case 'writer' :
                                isWriter = true;
                                break;
                            case 'reader' :
                                isReader = true;
                                break;
                        }
                    }
                }
                
                var data = {
                        id: id,
                        name: name,
                        display_name: displayName,
                        is_session_user: isSessionUser,
                        isadmin: isAdmin,
                        iswriter: isWriter,
                        isreader: isReader,
                        isexclude: isExclude,
                        number: nu // pour désambiguiser les noms égaux de casse différente
                    };
                nu++;
                return data;
            });
    }
    
    userNames.sortBy('display_name');

    var imports = [],
        exports = [];
    for (var f in addons) {
        switch(f.slice(0,7)) {
            case 'import_' :
                imports.push({ name : f.slice(7), key : f});
                break;
            case 'export_' :
                exports.push({ name : f.slice(7), key : f});
                break;
        }
    }
    
    var hasAddonImport = imports.length > 0,
        hasAddonExport = exports.length > 0,
        hasAddon = hasAddonImport || hasAddonExport;
    
    return {
        has_users: (userNames.length > 0 ? true : false),
        users: userNames,
        session_user_role: sessionUserRole,
        dbname: dbName,
        has_addon: hasAddon,
        has_addon_import: hasAddonImport,
        has_addon_export: hasAddonExport,
        addon_imports: imports,
        addon_exports: exports,
        mms: mms,
        is_public: isPublic,
        is_db_admin: isDbAdmin,
        is_sys_admin: isSysAdmin
    };
}