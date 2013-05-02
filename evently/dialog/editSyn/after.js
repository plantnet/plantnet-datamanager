function (e) {
    var app = $$(this).app,
        utilsLib = app.getlib('utils');

    utilsLib.hideBusyMsg("viewSyn");

    $('#edit-syn-modal').modal({ backdrop: 'static' });

    var mm = $("form#add-syn", this).attr("mm-data");

    function autocomplete(i) {
        $(i).autocomplete(
            //app.db.uri + mm + "/_view/label", {
            app.db.uri + '_design/datamanager/_list/labelac/label', {
                dataType: 'json',
                parse: function(data) { 
                    var active_syns = $('#active-syn tbody tr').map(function() {
                        return $(this).find('td').first().data('syn');
                    });
                    var ret = [];
                    for (var i=0; i < data.rows.length; i++) {
                        var row = data.rows[i];
                        var label = row.key[1];
                        if ($.inArray(label, active_syns) == -1) {
                            ret.push({
                                data: row,
                                value: label,
                                result: label
                            });
                        }
                    };
                    return ret;
                },
                formatItem: function(data, i, n, value, term) {
                    return value;
                },
                extraParams: {
                    // params for couchdb view
                    reduce : false,
                    cache : JSON.stringify(new Date().getTime()),
                    //q: '',
                    limit: 500,
                    startkey : function () { 
                        var v = $(i).val();
                        if (v.indexOf(' ') > 0) {
                            v = v.substring(0, v.indexOf(' '));
                        }
                        return JSON.stringify([mm, v]);
                    },
                    endkey : function () { 
                        var v = $(i).val();
                        if (v.indexOf(' ') > 0) {
                            v = v.substring(0, v.indexOf(' '));
                        }
                        return JSON.stringify([mm, v + "\ufff0"]); 
                    }
                },
                autoFill:true,
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