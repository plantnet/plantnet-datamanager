function() {
    var db = $$(this).app.db,
        inputbox = $('input.editw.ref', this),
        mm = inputbox.attr('data-mm'),
        id = inputbox.attr('id'),
        force_eoo = inputbox.data('force-eoo'),
        acSyn = $('#' + id + '-ac-syn');

    // old jQuery-autocomplete plugin
    inputbox.autocomplete(
        db.uri.substr(0, db.uri.lastIndexOf(db.name)) + '_fti/local/' + db.name + '/_design/datamanager/everyfield',
        {
            dataType: 'json',
            parse: function(data, terms) {
                var rows = [],
                    showSyns = acSyn.hasClass('active');
                if (data.rows) {
                    rows = data.rows.map(function(v) {
                        //$.log(v.doc.$label, v.doc.$synonym, showSyns, (showSyns || (! v.doc.$synonym)));
                        if (showSyns || (! v.doc.$synonym)) {
                            return {
                                data:v,
                                value:v.doc.$label,
                                result:v.doc.$label
                            };
                        }
                    });
                    // hacking part 3
                    // place results beginning by the first entered term at the top of the list (more intuitive) - what about other terms?
                    // note: does it really work? Maybe harmonize lucene limit and list max length to make it work
                    var splitTerms = terms.trim().split(' ');
                    rows.sort(function(a, b) {
                        if (a.value.toLowerCase().indexOf(splitTerms[0].toLowerCase()) == 0) {
                            return -1;
                        } else if (b.value.toLowerCase().indexOf(splitTerms[0].toLowerCase()) == 0) {
                            return 1;
                        } else {
                            return  (a < b) ? 1 : -1;
                        }
                    });
                }
                return rows;
            },
            formatItem: function(data, i, n, value, term) {
                return (data.doc.$synonym) ? '<span class="grey">' + value + '<span/>' : value;
            },
            formatSearchTerms: function(terms) { // unofficial method, relies on lib hacking (part 1)
                var enhancedTerms = '',
                    splitTerms = terms.replace(/-/g, ' ').trim().split(' ');
                for (var i=0; i < splitTerms.length; i++) {
                    // researched labels must contain words that begin by any search term
                    enhancedTerms += '_label:' + splitTerms[i] + '* ';
                }
                enhancedTerms = '_mm:' + mm.slice(8).replace(/-/g, '') + ' ' + enhancedTerms;
                return enhancedTerms;
            },
            forceRequestWhenCacheEmpty: true, // hacking part 2
            extraParams: {
                // params for Lucene
                include_docs: true,
                default_operator: 'AND',
                limit: 500,
                sort: '/_label_sort'
            },
            cacheLength: 0, // very important to set to 0, so that a new request is made each time!
            delay: 200,
            mustMatch: force_eoo,
            max: 50
        }
    ).result(function(event, item) {
        $(this).next('input.ref-id').val(item ? item.id : '');
    });
}