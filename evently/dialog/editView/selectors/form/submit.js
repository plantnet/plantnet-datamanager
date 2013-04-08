function(e) {
    var view = e.data.args[0],
        app = $$(this).app,
        utilsLib = app.getlib('utils'),
        name = $('input[name=name]', this).val();

    view.name = name;

    app.db.saveDoc(view, {
        success: function(newdoc) {
            $('#model-bloc').trigger('_init');
            $.pathbinder.go('/viewtable/' + newdoc.id + '/0/_id/0/0/0/0/0');
            utilsLib.showSuccess('View saved');
            $('#edit-view-modal').modal('hide');
        },
        error: function(a,b,c) {
            utilsLib.showError('Unable to save view: ' + a + b + c);
        }
    });

    return false;
}