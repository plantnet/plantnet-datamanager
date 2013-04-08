function(e) {
    var app = $$(this).app,
        utilsLib = app.getlib('utils'),
        cacheLib = app.getlib('cache'),
        selectionId = $('.doc-list').data('list-id'),
        openDocs = e.data.args[4];

    if (confirm('Sort selection by alphabetical order? Warning: this order will be maintained!')) {
        app.db.openDoc(selectionId, {
            success: function(selection) {
                $.log('sdoc reçu', selection);
                $.log('docs ouverts', openDocs);
                openDocs.rows.sort(function(a, b) {
                    var aModiLabel = cacheLib.get_name(app, a.doc.$mm, a.doc.$modi).toLowerCase(),
                        bModiLabel = cacheLib.get_name(app, b.doc.$mm, b.doc.$modi).toLowerCase();
                    if (aModiLabel == bModiLabel) {
                        if (a.doc.$label > b.doc.$label) {
                            return 1;
                        } else {
                            return -1;
                        }
                    } else if (aModiLabel > bModiLabel) {
                        return 1;
                    } else {
                        return -1;
                    }
                });
                selection.ids = [];
                openDocs.rows.map(function(d) {
                    selection.ids.push(d.doc._id);
                });
                app.db.saveDoc(selection, {
                    success: function() {
                        utilsLib.showSuccess('Selection sorted and saved');
                        $.pathbinder.go('/viewlist/select/' + selectionId + '/0/_/0');
                    },
                    error: function() {
                        utilsLib.showError('Error while saving sorted selection');
                    }
                });
            }, 
            error: function() {
                utilsLib.showError('Error while reading selection contents');
            }
        });
    }

    return false;
}