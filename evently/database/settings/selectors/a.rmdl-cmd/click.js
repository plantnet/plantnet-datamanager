function () {
    // remove deadlocks in case of emergency
    var app = $$(this).app,
        utilsLib = app.getlib('utils');

    var cpt = 1; // total number of locks

    function next() {
        cpt--;
        if (cpt == 0) {
            utilsLib.showSuccess('All locks deleted');
        }
    }

    app.db.openDoc('_local/lock_update_mm', {
        success: function(doc) {
            app.db.removeDoc(doc, {
                success: next,
                error: next
            });
        }, error: next
    });

    return false;
}