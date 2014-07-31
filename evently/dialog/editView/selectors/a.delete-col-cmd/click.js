function(e) {
    // delete field from view
    var app = $$(this).app,
        view = e.data.args[0],
        mm = e.data.args[1],
        unique = $('select#unique-field'),
        utilsLib = app.getlib('utils');

    var selectedFields = $('#cols').find('.selected-field:checked');

    if (! selectedFields.length) {
        utilsLib.showWarning('Select one or more fields first');
    } else {
        var idxToDel = [];
        selectedFields.each(function() {
            var row = $(this).closest('tr'),
                index = parseInt(row.attr('data-rowindex'));
            idxToDel.push(index);
            //$(this).closest('tr').remove();
        });
        for (var i=0, l=idxToDel.length; i<l; i++) {
            view.$cols.splice(idxToDel[i],1);
            // update indexes to del - cracra hack because splice instantly reduces the array
            for (var j=i+1; j<l; j++) {
                if (idxToDel[j] > idxToDel[i]) {
                    idxToDel[j]--;
                }
            }
        }
        utilsLib.showSuccess('Field(s) deleted');
    }

    $('#cols').trigger('_init', [view, mm]);
    unique.trigger('_init');

    return false;
};