function(e) {
    var app = $$(this).app,
        view = e.data.args[0],
        utilsLib = app.getlib('utils');

    var selectedFields = $('#cols').find('.selected-field:checked');

    if (selectedFields.length != 1) {
        utilsLib.showWarning('Select exactly one field');
    } else {
        selectedFields.each(function() {
            var row = $(this).closest('tr'),
                index = parseInt(row.attr('data-rowindex')),
                nextIndex = parseInt(row.next().attr('data-rowindex'));
            if (index < view.$cols.length - 1) {
                row.attr('data-rowindex', nextIndex);
                row.next().attr('data-rowindex', index);
                row.insertAfter(row.next());
                var tmp = view.$cols[index + 1];
                view.$cols[index + 1] = view.$cols[index];
                view.$cols[index] = tmp;
            }
        });
    }

    return false;
};