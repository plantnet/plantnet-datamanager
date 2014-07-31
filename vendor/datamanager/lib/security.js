exports.setRoles = function(db, roles, onSuccess, onError) {

    //roles = JSON.stringify(roles);

    db.dm_admin(db.name, 'set_roles', {}, { roles: roles }, onSuccess, function(data) {
        onError('Cannot modify roles for this database : ' + data.statusText);
    });

};

// roles : user_id -> roles (fusion)
// only server admin can use this function
exports.setUsersRolesBySysAdmin = function(roles, user_docs, onSuccess, onError) {

    user_docs.map(function(e) {
        // remove old "createdb" and "dropdb" roles
        var purgedRoles = [];
        for (var i=0; i < e.roles.length; i++) {
            if ((e.roles[i] == "createdb") || (e.roles[i] == "dropdb")) {
                continue;
            }
            purgedRoles.push(e.roles[i]);
        }
        var fusion = purgedRoles.concat(roles[e._id]).unique();
        e.roles = fusion;
    });

    $.couch.userDb(function (userDb) {
        userDb.bulkSave({docs : user_docs}, {
            success : function(docs) {
                for (var d = 0; d < docs.length; d++) {
                    if (docs[d].error) {
                        onError(docs[d].error);
                        return;
                    }
                }
                onSuccess();
            },
            error : onError
        });
    });
};