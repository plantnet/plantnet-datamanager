function(e) {
    var app = $$(this).app,
        queryLib = app.getlib('query'),
        utilsLib = app.getlib('utils'),
        modi = $(this).data('modi'),
        structid = $(this).data('structid'),
        fieldName = $(this).data('fieldname'),
        inputField = $('input#' + fieldName);

    var q = {
        $mm: structid,
        $modi: modi
    };

    var sortParams = [{
        type: 'integer',
        field: fieldName,
        modi: modi,
        order: -1
    }];

    queryLib.lucene_query(app.db, onSuccess, q, 0, 1, false, sortParams);

    function onSuccess(data) {
        $.log('data', data);
        if (data && data.rows) {
            var lui = 1;
            if (data.rows.length) {
                if (('sort_order' in data.rows[0]) && (data.rows[0].sort_order.length)) {
                    lui = data.rows[0].sort_order[0];
                    lui++; // beware if saved as String - should not happen but onséjamé
                } else {
                    onError();
                }
            } // else no data yet
            //utilsLib.showSuccess('Last used integer: ' + lui);
            inputField.val(lui);
        } else {
            onError();
        }
    }

    function onError() {
        utilsLib.showError('Could not obtain last used number');
    }
}