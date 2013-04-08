function() {
    var app = $$(this).app,
        utilsLib = app.getlib('utils'),
        ck = $('.doc-container input.ck:checked');

    if (ck.length != 1) {
        utilsLib.showWarning('Please select only one doc');
    } else {
        var id = ck.val(),
        mm_id = ck.data("mm-id");
        mm_id = app.libs.utils.encode_design_id(mm_id);

        ck.attr('checked', false);

        if (id) {
            $.pathbinder.go("/images/" + mm_id + "/0/parent/" + id);
        }
    }
    return false;
}