function (callback, e, params) {
    var id = params.id,
        app = $$(this).app,
        nb_rev = 2,
        revs,
        isDdoc = false,
        origin = params.origin,
        isconflict;

    // cracra hack
    if (id.substr(0, 8) == '_design|') {
        isDdoc = true;
        id = id.replace('|', '/');
    }

    app.db.openDoc(id, {
        revs: true,
        conflicts: true,
        success: function(doc) {
            if (doc._conflicts && doc._conflicts.length) {
                revs = doc._conflicts.slice();
                revs.push(doc._rev);
                isconflict = true;
            } else {
                // get revisions
                isconflict = false;
                var start = +doc._revisions.start,
                ids = doc._revisions.ids;

                revs = [];
                for (var i = 0; i < ids.length && i < nb_rev; i++) {
                    revs.push((start--) + '-' + ids[i]);
                }
            }
            var docs = [], cpt = revs.length + 1;
            
            // parallel calls
            revs.forEach(function(e) {
                app.db.openDoc(id, {
                    rev: e,
                    success: function(doc) {
                        docs.push(doc);
                        next();
                    },
                    error: function() {
                        next();
                    }
                });
            });
            next();
            
            function next() {
                cpt--;
                if (cpt <= 0) {
                    callback(docs, id, isconflict, origin, isDdoc);
                }
            }
        }
    });
}