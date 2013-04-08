function(callback, e, params) {
    var app = $$(this).app,
        utilsLib = app.getlib('utils'),
        cacheLib = app.getlib('cache'),
        db = app.db,
        $this = $(this),
        id = params.id,
        time = JSON.stringify(new Date().getTime());
    
    db.openDoc(id, { 
        conflicts: true,
        success: function(doc) {
            if (doc._conflicts) {
                $this.trigger('viewRevs', {id: id});
            } else {
                var mm = cacheLib.get_cached_mm(app, doc.$mm);
                if (!mm.isref) {
                    var root = app.libs.utils.get_root(doc);
                    // get related documents if not dict
                    db.view('datamanager/related', {
                        // open all related from the root doc
                        key: root,
                        include_docs: true,
                        cache: time,
                        success: function(related) {
                            loadSynLabels(id, mm, related);
                        }
                    });
                } else {
                    // get related documents if not dict
                    db.view('datamanager/related1', {
                        // open all related from the root doc
                        key: id,
                        include_docs: true,
                        cache: time,
                        success: function(related) {
                            loadSynLabels(id, mm, related);
                        }
                    });
                }
            }
        }, 
        error: function() {
            utilsLib.showError('Cannot find doc');
        }
    });

    // loads label of docs' "valid names", if docs are synonyms
    function loadSynLabels(id, mm, related) {
        var synLabels = {},
            synKeys = [];

        for (var d=0; d < related.rows.length; d++) {
            var doc = related.rows[d].doc;
            if (doc.$synonym) {
                synKeys.push([0, doc.$synonym]);
            }
        }

        db.view('datamanager/label', {
            keys: synKeys,
            reduce: false,
            success: function(data) {
                // associate valid name's _id to label
                for (var i=0; i < data.rows.length; i++) {
                    var row = data.rows[i];
                    synLabels[row.id] = row.value.label;
                }
                // as
                callback(id, mm, related, synLabels);
            },
            error: function(err) {
                $.log('Error while loading valid names labels', err);
                callback(id, mm, related, synLabels);
            }
        });
    }
}