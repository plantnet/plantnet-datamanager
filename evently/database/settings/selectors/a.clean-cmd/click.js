function() {
    var app = $$(this).app,
        dbLib = app.getlib('db'),
        utilsLib = app.getlib('utils');

    utilsLib.showBusyMsg('Compacting the database in progress...', 'dbCompacting');

    function done() {
        utilsLib.showSuccess('View cleanup triggered for database "' + app.db.name + '". Use "active tasks" panel to watch progress');
        utilsLib.hideBusyMsg('dbCompacting');
    }

    dbLib.compact_db(app.db, app.ddoc, function() {
        utilsLib.showSuccess('Database compaction triggered. Use "active tasks" panel to watch progress');

        app.db.viewCleanup({
            success: done,
            error: done
        });
    });

    return false;
}