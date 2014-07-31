function(e) {
    var query = e.data.args[0],
        app = $$(this).app,
        utilsLib = app.getlib('utils');

    $('#criteria').trigger('save', [query]);

    var name = $('input[name=name]', this).val(),
        rename = false;
    // if name has changed, propose to save as a new query
    if ((query.name != '') && (query.name != name)) {
        rename = true;
    }
    query.name = name;

    var select = $('select#modt', this).val();
    if (select == '') {
        select = $('select#modi', this).val();
    }
    query.$select = select;

    if (query.$criteria.length === 0) {
        utilsLib.showWarning('Cannot save query: no criteria');
        return false;
    }

    if (rename) {
        if (confirm("You renamed the query. Save it as a copy? The original won't be altered.")) {
            delete query._id;
            delete query._rev;
        }
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