function(e) {
    var query = e.data.args[0],
        app = $$(this).app,
        utilsLib = app.getlib('utils');

    $('#criteria').trigger('save', [query]);

    query.name = $('input[name=name]', this).val();
    var select = $('select#modt', this).val();
    if (select == '') {
        select = $('select#modi', this).val();
    }
    query.$select = select;

    if (query.$criteria.length === 0) {
        utilsLib.showWarning('Cannot save query: no criteria');
        return false;
    }

    app.db.saveDoc(query, {
        success : function(newdoc) {
            $('#model-menu').trigger('_init');
            $('#edit-query-modal').modal('hide');
            $('#dialog-bloc').trigger('chooseView', [newdoc.id]);
            utilsLib.showSuccess('Query saved');
        },
        error : function (a,b,c) {
            utilsLib.showError(a + b + c);
        }
    });

    return false;
}