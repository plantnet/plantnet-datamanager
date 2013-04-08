function() {
    var utilsLib = $$(this).app.getlib('utils'),
        ck = $('ul#root input.ck:checked'),
        id = null;

    if (ck.length != 1) {
        utilsLib.showWarning('Please select only one parent doc.')
    } else {
        id = ck.val();
    }
    $('#tree-toolbar ul.submodis').trigger('_init', [id]);

    return false;
}