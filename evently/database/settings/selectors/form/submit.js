function() {
    var app = $$(this).app, 
        utilsLib = app.getlib('utils'),
        dbName = app.db.name,
        rights = {};

    $('table tbody tr', this).each( function(i) {
        var userName = $(this).attr('data-user'),
            isAdmin = $('input.admin', this).attr('checked'),
            isWriter = $('input.writer', this).attr('checked'),
            isReader = $('input.reader', this).attr('checked'),
            isExclude = $('input.exclude', this).attr('checked'),
            userDbRight = null;
        
        if (isAdmin) { userDbRight = dbName + '.admin'; };
        if (isWriter) { userDbRight = dbName + '.writer'; };
        if (isReader) { userDbRight = dbName + '.reader'; };
        if (isExclude) { userDbRight = dbName + '.exclude'; };
        
        if (userDbRight != null) {
            rights[userName] = [userDbRight];
        }
    });

    function onSuccess(msg) {
        $.pathbinder.begin();
        utilsLib.showSuccess('Database authorization updated.');
    };
    function onError(err) {
        utilsLib.showError(err);
    };

    var secLib = app.getlib('security');
    secLib.setRoles(app.db, rights, onSuccess, onError);

    return false;
}