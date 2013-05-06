function() {
    var app = $$(this).app,
        utilsLib = app.getlib('utils'),
        ck = $('.doc-container input.ck:checked');

    if (ck.length < 1) {
        utilsLib.showWarning('Please select at least one doc to edit synonymy');
    } else if (ck.length == 1) { // regular synonyms editor 
        var id = ck.val();
        ck.attr('checked', false);
        if (id) {
            $('#dialog-bloc').trigger('editSyn', [id]);
        }
    } else { // add multiple synonyms at once
        var ids = [];
        ck.each(function() {
            ids.push($(this).val());
            //$(this).attr('checked', false); // annoying in case of complex/large selection
        });
        if (ids.length) {
            $('#dialog-bloc').trigger('editSyn', [ids]);
        }
    }

    return false;
}

