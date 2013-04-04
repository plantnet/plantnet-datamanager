function() {
    var app = $$(this).app,
    utilsLib = app.getlib('utils'),
    ck = $('.doc-container input.ck:checked');

    if (ck.length != 1) {
        utilsLib.showWarning('Please select only one doc to edit')
    } else {
        var id = ck.val();
        ck.attr('checked', false);

        var has_attchs = ck.data("attchs");

        if (id && has_attchs) {
            var trigger = new app.libs.utils.Trigger(
                $("#model-content"), "viewDoc", [{id : id}], false);

            $('#dialog-bloc').trigger('editFile', [id, trigger]);
        } else {
            utilsLib.showError('Doc does not support attachments');
        }
    }
    return false;
}

