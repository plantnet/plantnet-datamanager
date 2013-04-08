function (newDoc, oldDoc, userCtx) {
    var roles = userCtx.roles,
        dbName = userCtx.db,
        sysAdminRole = '_admin',
        adminRole = dbName + '.admin',
        writerRole = dbName + '.writer';

    // ensure write permission
    if (roles.indexOf(adminRole) < 0 && roles.indexOf(writerRole) < 0 && roles.indexOf(sysAdminRole) < 0) {
        throw({forbidden : 'no write permission'});
    }
    
    // do not write a locked _design/mm
    if (oldDoc && oldDoc.$locked) {
         throw({forbidden : 'Cannot write locked Document'});
    }
};