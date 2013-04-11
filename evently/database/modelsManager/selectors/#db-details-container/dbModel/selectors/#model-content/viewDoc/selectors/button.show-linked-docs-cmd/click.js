function() {
    var app = $$(this).app,
        ck = $('.doc-header input.ck:checked'),
        cacheLib = app.getlib('cache'),
        utilsLib = app.getlib('utils'),
        time = JSON.stringify(new Date().getTime());

    if (ck.length == 0) {
        utilsLib.showWarning('Please select at least one doc');
        return false;
    }

    ck.each(function() {
        var id = $(this).val(),
            ulRef = $(this).parent().parent().find('ul.linked-docs');

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