function(e) {
    var app = $$(this).app,
        utilsLib = app.getlib('utils'),
        ck = $('.doc-list input.ck:checked'),
        terms = e.data.args[0],
        action = e.data.args[2],
        title = e.data.args[3],
        skip = e.data.args[5],
        showImages = e.data.args[9];

    if (ck.length != 1) {
        utilsLib.showWarning('Please select only one doc to edit');
    } else {
        var id = ck.val();
        ck.attr('checked', false);
        if (id) {
            var trigger = new utilsLib.Trigger(null, null, null, '/viewlist/' + action + '/' + title + '/' + skip + '/' + terms + '/' + showImages);
            $('#dialog-bloc').trigger('editDoc', [id, null, trigger]);
        }
    }
    return false;
}