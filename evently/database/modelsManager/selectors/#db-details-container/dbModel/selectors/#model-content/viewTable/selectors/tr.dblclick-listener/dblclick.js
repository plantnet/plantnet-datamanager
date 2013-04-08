function(e) {
    // Double click on the row to view details
    // Double click on the row while holding Ctrl to trigger edition
    var app = $$(this).app,
        id = $(this).find('input.ck').val();

    if (e.ctrlKey) {
        trigger = new app.libs.utils.Trigger(null, null, null, true);
        $('#dialog-bloc').trigger('editDoc', [id, null, trigger]);
    } else {
        $.pathbinder.go('/viewdoc/' + id);
    }
}