function() {
    var db = $$(this).app.db,
        inputbox = $('input.editw.ref', this),
        mm = inputbox.attr('data-mm'),
        force_eoo = inputbox.data('force-eoo');

    inputbox.autocomplete(
        db.uri + '_design/datamanager/_list/labelac/label', {
            dataType: 'json',
            parse: function(data) {
                var rows = data.rows.map(
                    function(v) {
                        return {
                            data:v,
                            value:v.key[1],
                            result:v.key[1]
                        };
                    }
                );
                return rows;
            },
            formatItem: function(data, i, n, value, term) {
                return (data.value.syn) ? '<span class="grey">' + value + '<span/>' : value;
            },
            extraParams: {
                // params for couchdb view
                //q: '',
                limit: 500,
                reduce: false,
                cache: JSON.stringify(new Date().getTime()),
                startkey: function () { 
                    //return JSON.stringify(inputbox.val());
                    var v = inputbox.val();
                    if (v.indexOf(' ') > 0) {
                        v = v.substring(0, v.indexOf(' '));
                    }
                    return JSON.stringify([mm, v]);
                },
                endkey: function () { 
                    //return JSON.stringify(inputbox.val() + "\ufff0");
                    var v = inputbox.val();
                    if (v.indexOf(' ') > 0) {
                        v = v.substring(0, v.indexOf(' '));
                    }
                    return JSON.stringify([mm, v + '\ufff0']); 
                }
            },
            delay: 10,
            mustMatch: force_eoo,
            max: 50
        }
    ).result(function(event, item) {
        $(this).next('input.ref-id').val(item ? item.id : '');
    });
}