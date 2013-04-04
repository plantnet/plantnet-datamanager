function(e, doc, mm) {
    var fieldName = $(this).attr('data-name'),
        mandatory = $(this).data('mandatory'),
        defaultValue = $(this).attr('data-default-value'),
        index = $(this).index(),
        min = mm.modules[doc.$modt].fields[index].min,
        max = mm.modules[doc.$modt].fields[index].max,
        step = mm.modules[doc.$modt].fields[index].step;

    var value = doc[fieldName];
    if (value === null || value == undefined) {
        value = defaultValue;
    }
    
    return {
        name: fieldName,
        value: value,
        min: min,
        max: max,
        step: step,
        required : mandatory
    };
};