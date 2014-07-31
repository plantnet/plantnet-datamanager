function(e, doc, mm) {

    var fieldName = $(this).attr('data-name'),
        fieldLabel = $(this).attr('data-field-label'),
        mandatory = $(this).data('mandatory'),
        defaultValue = $(this).attr('data-default-value');

    var values = doc[fieldName] ? doc[fieldName] : [];
    var existingValues = [];
    for (var i = 0; i < values.length; i++) {
        var remove = true;
        if (i == 0) {
            remove = false;
        }
        existingValues.push({value: values[i], remove: remove});
    }
    var isEmpty = existingValues.length > 0 ? false : true;

    return {
        name: fieldName,
        label: fieldLabel,
        existingValues: existingValues,
        defaultValue: defaultValue,
        isEmpty: isEmpty
    };
}