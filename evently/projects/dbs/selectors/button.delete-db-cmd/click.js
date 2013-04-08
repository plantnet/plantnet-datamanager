function() {
    var dbname = $(this).attr('data-db-name');
    
    if (dbname) {
        var answer = confirm('Delete DB "' + dbname + '" and data ? It cannot be undone.');
        if (answer) {
            answer = confirm("Really sure ?");
            if (answer) {
                answer = confirm("Really really sure ?");
                if (answer) {
                    var app = $$(this).app,
                        utilsLib = app.libs.utils,
                        dbLib = app.getlib('db'),
                        userCtx = app.data.userCtx,
                        onSuccess = function() {
                            $.pathbinder.begin();
                            utilsLib.showSuccess('Database "' + dbname + '" deleted.');
                        },
                        onError = utilsLib.showError;
                    
                    dbLib.drop_db(dbname, app.db, userCtx.name, onSuccess, onError);
                }
            }
        }
    } else {
        utilsLib.showError('This database has no name. Please contact an administrator.')
    }

    return false;
};