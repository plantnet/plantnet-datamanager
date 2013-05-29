function (e, changes) {
    var app = $$(this).app,
        cacheLib = app.require('vendor/datamanager/lib/cache');

    $('#db-docs-info').trigger('_init');

    var now = Date.now();
    
    // test lock (time based)
    if (!app.data.lock_changes || app.data.lock_changes < now) {
        $.log("up_changes", app.data.lock_changes, now);
        app.db.dm('up_changes', null, null, function(d) {
            //$.log('up changes', d);
        });
    }
    var mm_changed = false;

    changes = changes.results;
    for (var i = 0, l = changes.length; i < l; i++) {
        if (changes[i].id.slice(0, 10) == '_design/mm') {
            // renit cache if a design doc has changed
            mm_changed = true;
        }
    }
    
    if (mm_changed) {
        cacheLib.init_all_mms(app, function(newMms) {
            setTimeout(function () {
                $('#models-catalog').trigger('_init');
                $('#db-nav-container').trigger('_init');
            }, 2000); // timeout to avoid collision with other events
        });
    }
    
    // propagate event

    $(".changes").trigger("changes", [changes]);
}