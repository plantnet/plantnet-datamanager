function (e, query, mm) {

    var db = $$(this).app.db;

    $("input.value.ref").each(
        function (i) {
            var mm_ref_id = $(this).attr("mmrefid-data");
            if(!mm_ref_id) {
                return;
            }

            $(this).autocomplete(
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
                        enhancedTerms = '_mm:' + mm_ref_id.slice(8).replace(/-/g, '') + ' ' + enhancedTerms;
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
                    max: 50
            });
    });

    // date inputs
    $('.date', this).each(function() {
        $(this).datepicker({
            dateFormat: 'yy-mm-dd',
            showOtherMonths: true,
            constrainInput: false,
            changeYear: true,
            changeMonth: true,
            yearRange: 'c-100:c+1'
        });
    });
    // time inputs
    $('.time', this).each(function() {
        $(this).timepicker({
            showPeriodLabels: false
        });
    });
    // numeric inputs
    $('.number', this).each(function() {
        $(this).attr('pattern', '\-?[0-9]+\.?[0-9]*');
    });
}