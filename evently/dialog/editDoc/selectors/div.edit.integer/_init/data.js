function(e, doc, mm) {
    var app = $$(this).app,
        fieldName = $(this).attr('data-name'),
        mandatory = $(this).data('mandatory'),
        isSerial = $(this).data('is-serial'),
        defaultValue = $(this).data('default-value'),
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
        value : value,
        name : fieldName,
        required: mandatory,
        isSerial: isSerial,
        structid: mm._id,
        modi: doc.$modi
    };
};