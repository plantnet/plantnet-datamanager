function() {
    var app = $$(this).app,
        utilsLib = app.getlib('utils');

    var selectedFields = $(this).closest('div.fields-bloc').find('.selected-field:checked');

    if (selectedFields.length != 1) {
        utilsLib.showWarning('Select exactly one field');
    } else {
        selectedFields.each(function() {
            var row = $(this).closest('tr');
            row.insertAfter(row.next());
        });
    }

    return false;
};