function(e, doc, mm) {
    // get name + type in id
    var fieldName = $(this).attr('data-name'),
        mandatory = $(this).data('mandatory'),
        defaultValue = $(this).attr('data-default-value'),
        index = $(this).closest('.control-group').index() - 1,
        enumValues = mm.modules[doc.$modt].fields[index].values,
        values = [];
        value = null;

    if (defaultValue != '' && doc[fieldName] == '') {
        value = '';
    } else {
        value = doc[fieldName] || defaultValue;
    }
    value = value + '';

    // Add no selection
    values.push({
        value: '',
        title: 'Select a value',
        selected: value === ''
    });
    
    // Add enum values
    if (enumValues) {
        /*if (enumValues.constructor === Array) {
            enumValues.sort();
        }*/
    
        for (var i = 0; i < enumValues.length; i++) {
            values.push({
                    value: enumValues[i],
                    title: enumValues[i],
                    selected: enumValues[i] === value
                });
        }
    }
        
    return {
        values : values,
        name : fieldName,
        required: mandatory
    };
}