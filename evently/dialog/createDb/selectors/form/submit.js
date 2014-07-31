function(event) {
    var dbname = $('input[name="dbname"]', this).val(),
        app = $$(this).app,
        utilsLib = app.getlib('utils'),
        forkDb =  $('input#db-fork-url', this).val();

    if (dbname) {
        userCtx = app.data.userCtx,
        
        onSuccess = function() {
            if (forkDb) {
                var replib = app.getlib("replicateng"),
                rep = new replib.Replicator();

                rep.replicate(forkDb, dbname, false, null, null, 
                              userCtx, function (data) { $.log(data);}, utilsLib.showError);
            }


            $.pathbinder.begin();
            utilsLib.showSuccess('Database "'+ dbname + '" created.');
        },
        onError = utilsLib.showError,
        
        desc = $('textarea[name="dbdesc"]', this).val(),
        dbLib = app.getlib('db');
        dbLib.create_db(dbname, desc, app.db, userCtx.name, onSuccess, onError);
        $('#create-db-modal').modal('hide');

    } else {
        utilsLib.showError('You need to define a name for your database.')
    }
    return false;
};