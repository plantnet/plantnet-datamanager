function (e) {
    var app = $$(this).app,
        db = app.db,
        utilsLib = app.getlib('utils');

    utilsLib.hideBusyMsg('viewSyn');
    utilsLib.hideBusyMsg('editSyn');

    $('#edit-syn-modal').modal({ backdrop: 'static' });

    var mm = $("#edit-syn-modal .modal-body").attr("mm-data");

    function autocomplete(i) {
        $(i).autocomplete(
            db.uri.substr(0, db.uri.lastIndexOf(db.name)) + '_fti/local/' + db.name + '/_design/datamanager/everyfield',
            {
                dataType: 'json',
                parse: function(data, terms) {
                    var rows = [];
                    if (data.rows) {
                        rows = data.rows.map(function(v) {
                            return {
                                data:v,
                                value:v.doc.$label,
                                result:v.doc.$label
                            };
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
                        splitTerms = terms.trim().split(' ');
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
                //autoFill:true, produces strange results combined with hackings
                max: 50
            }).result(function(event, item) {
                $(i).next("input.id").val(item.id);
            });
    }

    $(".autocomplete", this).each(function() {
        autocomplete(this);
    });

    $("input#new-syn", this).focus();
}