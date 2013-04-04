function(e, doc, mm) {
    var fieldName = $(this).attr('data-name'),
        defaultValue = $(this).data('default-value'),
        value = (doc[fieldName] === undefined) ? defaultValue : doc[fieldName],
        isTrue = false,
        isFalse = false,
        isNull = false;
    
    if (value === true || value === 'checked') { // patch to update old docs that still have [true] values stored as string 'checked'
        isTrue = true;
    } else if (value === false) {
        isFalse = true;
    } else if (value === '' || value === undefined) {
        isNull = true;
    }
    
    return {
        value: value,
        checked: value,
        name: fieldName,
        is_true: isTrue,
        is_false: isFalse,
        is_null: isNull
    };
};