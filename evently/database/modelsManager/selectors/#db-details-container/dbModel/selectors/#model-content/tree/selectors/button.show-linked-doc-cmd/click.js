function() {
    var app = $$(this).app,
        ck = $('ul.treenode input.ck[value!=""]:checked'),
        cacheLib = app.getlib('cache'),
        time = JSON.stringify(new Date().getTime());

    ck.each(function() {
        var ulRef = $(this).closest('li').find('ul.linked-docs').first(),
            id = $(this).val();
        
        if (ulRef.css('display') != 'none') {
            ulRef.hide();
        } else {
            app.db.view('datamanager/refs', {
                cache: time,
                startkey : id,
                endkey: id,
                include_docs: true,
                success: function(refData) {
                    ulRef.empty();
                    if (refData.rows.length < 1) {
                        ulRef.append('<li class="muted">No linked docs</li>');
                    } else {
                        var docs = [];
                        docs = refData.rows.map(function(row) {
                            return row.doc;
                        });
                        for (var i = 0; i < docs.length; i++) {
                            var doc = docs[i],
                                label = doc.$label;
                                structname = cacheLib.get_cached_mm(app, doc.$mm).name,
                                modname = cacheLib.get_name(app, doc.$mm, doc.$modi),
                            ulRef.append('<li><a href="#/viewdoc/' + doc._id + '">&nbsp;'
                                    + '[' + structname + ' - ' + modname + '] ' + label + '</a></li>');
                        }
                    }
                    ulRef.show();
                }
            });
        }
    });
}