function() {
    var utilsLib = $$(this).app.getlib('utils'),
        ck = $('.doc-container input.ck:checked');

    if (ck.length != 1) {
        utilsLib.showWarning('Please select only one parent doc');
        $('.doc-toolbar ul.submodis').trigger('_init');

    } else {
        var id = ck.val(),
        mm_id = ck.data("mm-id"),
        parent_modi = ck.data("modi");
        
        $('.doc-toolbar ul.submodis').trigger('_init', [id, mm_id, parent_modi]);
    }
    return false;
}