function() {
    var app = $$(this).app,
        ck = $('ul.treenode input.ck:checked'),
        time = JSON.stringify(new Date().getTime());

    ck.each(function () {
        var ulSyn = $(this).closest('li').find('ul.syn').first(),
            id = $(this).val();

        if (ulSyn.css('display') != 'none') {
            ulSyn.hide();
        } else {
            app.db.view('datamanager/synonym', {
                cache: time,
                key: id,
                include_docs: true,
                reduce: false,
                success: function(synData) {
                    ulSyn.empty();
                    if (synData.rows.length < 2) {
                        ulSyn.append('<li class="muted">No Synonyms</li>');
                    } else {
                        synData.rows.forEach(function(e) {
                            if (e.id != id) {
                                var label = e.doc.$label;
                                ulSyn.append('<li class="muted">' + label + '</li>');
                            }
                        });
                    }
                    ulSyn.show();
                }
            });
        }
    });
}