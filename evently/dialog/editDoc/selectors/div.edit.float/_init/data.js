function(e, doc, mm) {
    var app = $$(this).app,
        utils = app.getlib('utils'),
        fieldName = $(this).attr('data-name'),
        mandatory = $(this).data('mandatory'),
        defaultValue = $(this).attr('data-default-value'),
        min = $(this).attr('data-min'),
        max = $(this).attr('data-max'),
        step = $(this).attr('data-step') || 'any',
        hasMin = (min == 0 || min) ? true : false,
        hasMax = (max == 0 || max) ? true : false,
        value = null,
        hasDefaultValue = !! (defaultValue != undefined && defaultValue !== ''),
        isEmptyValue = !! (doc[fieldName] === ''),
        isUndefinedValue = !! (doc[fieldName] === undefined);
    
    if (hasDefaultValue && isEmptyValue) {
        value = '';
    } else {
        value = (isUndefinedValue) ? defaultValue :  doc[fieldName];
    }
    
    return {
        value: utils.toFixed(value),
        name: fieldName,
        required: mandatory,
        has_min: hasMin,
        min: min,
        has_max: hasMax,
        max: max,
        step: step
    };
};