function(e) {
    var app = $$(this).app,
        db = app.db,
        utilsLib = app.getlib('utils'),
        selected_rev = $('input[name="selection"]:checked').val(),
        origin = $(this).data('origin'),
        revs = e.data.args[0],
        docs = [];

    for (var i = 0; i < revs.length; i++) {
        var d = revs[i];
        d._deleted = (d._rev !== selected_rev);
        docs.push(d);
    }

    utilsLib.showBusyMsg('Resolving conflict...', 'conflicts');

    db.bulkSave({docs: docs}, {
        success : function(res) {
            utilsLib.hideBusyMsg('conflicts');
            if (app.data.trigger) {
                app.data.trigger.trigger();
            } else {
                if (origin == 'conflicts') {
                    $.pathbinder.go('/viewlist/conflict/0/0/conflict/0');
                } else {
                    if (docs[0].$mm) {
                        $.pathbinder.go('/viewdoc/' + docs[0]._id);
                    } else {
                        $.pathbinder.go('/db-home');
                    }
                }
            }
        }
    });

    return false;
}