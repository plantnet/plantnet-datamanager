function(e) {
    // Double click on the doc's fields while holding Ctrl to trigger edition
    var app = $$(this).app,
    utilsLib = app.getlib('utils'),
        terms = e.data.args[0],
        action = e.data.args[2],
        title = e.data.args[3],
        skip = e.data.args[5],
        showImages = e.data.args[9],
        id = $(this).parent().find('input.ck').val();

    if (e.ctrlKey) {
        var trigger = new utilsLib.Trigger(null, null, null, '/viewlist/' + action + '/' + title + '/' + skip + '/' + terms + '/' + showImages);
        $('#dialog-bloc').trigger('editDoc', [id, null, trigger]);
    }
}