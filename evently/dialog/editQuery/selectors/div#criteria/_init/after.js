function (e, query, mm) {

    var db = $$(this).app.db;

    $("input.value.ref").each(
        function (i) {
            var mm_ref_id = $(this).attr("mmrefid-data");
            if(!mm_ref_id) {
                return;
            }

            var inputbox = $(this);
            $(this).autocomplete(
                //db.uri + mm_ref_id + "/_view/label", {
                db.uri + '_design/datamanager/_list/labelac/label', {
                    dataType: 'json',
                    parse: function(data) {
                        var rows = data.rows.map(function(v) {
                            return {
                                data:v,
                                value:v.key[1],
                                result:v.key[1]
                            };
                        });
                        return rows;
                    },
                    formatItem: function(data, i, n, value, term) {
                        return (data.value.syn) ? '<span class="grey">' + value + '<span/>' : value;
                    },
                    extraParams: {
                        // params for couchdb view
                        //q: '',
                        limit: 500,
                        reduce : false,
                        startkey : function () { 
                            //return JSON.stringify(inputbox.val());
                            var v = inputbox.val();
                            if (v.indexOf(' ') > 0) {
                                v = v.substring(0, v.indexOf(' '));
                            }
                            return JSON.stringify([mm_ref_id, v]);
                        },
                        endkey : function () { 
                            //return JSON.stringify(inputbox.val() + "\ufff0");
                            var v = inputbox.val();
                            if (v.indexOf(' ') > 0) {
                                v = v.substring(0, v.indexOf(' '));
                            }
                            return JSON.stringify([mm_ref_id, v + "\ufff0"]);
                        }
                    },
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