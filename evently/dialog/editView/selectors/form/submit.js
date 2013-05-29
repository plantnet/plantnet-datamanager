function(e) {
    var view = e.data.args[0],
        app = $$(this).app,
        utilsLib = app.getlib('utils'),
        name = $('input[name=name]', this).val();

    var rename = false;
    // if name has changed, propose to save as a new view
    if ((view.name != '') && (view.name != name)) {
        rename = true;
    }

    view.name = name;

    if (rename) {
        if (confirm("You renamed the view. Save it as a copy? The original won't be altered.")) {
            delete view._id;
            delete view._rev;
        }
    }
    app.db.saveDoc(view, {
        success: function(newdoc) {
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