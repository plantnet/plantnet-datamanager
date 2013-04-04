function() {
    // delete field from UI
    var app = $$(this).app,
        utilsLib = app.getlib('utils');

    var selectedFields = $(this).closest('div.fields-bloc').find('.selected-field:checked');

    if (! selectedFields.length) {
        utilsLib.showWarning('Select one or more fields first');
    } else {
        selectedFields.each(function() {
            $(this).closest('tr').remove();
        });
        utilsLib.showSuccess('Field(s) deleted');
    }

    return false;
};