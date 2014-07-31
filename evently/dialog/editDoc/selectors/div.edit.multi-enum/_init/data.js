function(e, doc, mm) {
    // get name + type in id
    var fieldName = $(this).attr('data-name'),
        fieldLabel = $(this).attr('data-field-label'),
        mandatory = $(this).data('mandatory'),
        defaultValue = $(this).attr('data-default-value').split(','),
        index = $(this).closest('.control-group').index() - 1,
        enumValues = mm.modules[doc.$modt].fields[index].values,
        values = [],
        value = null;

    if (defaultValue.length > 0 && doc[fieldName] == '') {
        value = [];
    } else {
        value = doc[fieldName] || defaultValue;
    }

    var valuesList = [];
    if (enumValues) {
        for (var i = 0; i < enumValues.length; i++) {
            var v = enumValues[i],
                selected = (value && value.toString().indexOf(v) >= 0);
            values.push({
                value: v,
                selected: selected
            });
            if (selected) {
                valuesList.push(v);
            }
        }
    }

    return {
        values: values,
        value: value,
        name: fieldName,
        label: fieldLabel,
        required: mandatory
    };
}