function(event) {
    var dbname = $('input[name="dbname"]', this).val();
    if (dbname) {
        var app = $$(this).app,
            utilsLib = app.libs.utils,
            userCtx = app.data.userCtx,
            onSuccess = function() {
                $.pathbinder.begin();
                utilsLib.showSuccess('Database "'+ dbname + '" created.');
            },
            onError = utilsLib.showError,
            desc = $('textarea[name="dbdesc"]', this).val(),
            dbLib = app.getlib('db');
        
        dbLib.create_db(dbname, desc, app.db, userCtx.name, onSuccess, onError);
    } else {
        utilsLib.showError('You need to define a name for your database.')
    }
    $('#create-db-modal').modal('hide');
    return false;
};