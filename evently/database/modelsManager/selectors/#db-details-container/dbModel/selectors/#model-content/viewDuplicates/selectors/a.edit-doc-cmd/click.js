function () {
    var app = $$(this).app,
        utilsLib = app.getlib('utils'),
        id = $(this).data('id'),
        oid = $(this).data('oid');

    if (id) {
        var trigger = new app.libs.utils.Trigger(null, null, null, '/viewdups/' + oid + '/0');
        $("#dialog-bloc").trigger("editDoc", [id, null, trigger]);
    } else {
        utilsLib.showError('Invalid doc id');
    }

    return false;
}