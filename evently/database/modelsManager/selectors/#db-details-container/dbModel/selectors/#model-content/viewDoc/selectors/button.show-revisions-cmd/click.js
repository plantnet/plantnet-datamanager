function() {
    var app = $$(this).app,
        utilsLib = app.getlib('utils'),
        ck = $('.doc-container input.ck:checked');

    if (ck.length != 1) {
        utilsLib.showWarning('Please select only one doc');
    } else {
        var id = ck.val();
        ck.attr('checked', false);

        if (id) {
            $.pathbinder.go("/viewrevs/" + id + '/0');
        }
    }
    return false;
}