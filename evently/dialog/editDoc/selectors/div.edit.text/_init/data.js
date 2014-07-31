function(e, doc, mm) {
    var fieldName = $(this).attr('data-name'),
        mandatory = $(this).data('mandatory'),
        defaultValue = $(this).attr('data-default-value'),
        value = null;
    
    if (defaultValue == '' && doc[fieldName] == '') {
        value = '';
    } else {
        value = doc[fieldName] || defaultValue;
    }
    
    return {
        value: value,
        name: fieldName,
        required : mandatory
    };
}