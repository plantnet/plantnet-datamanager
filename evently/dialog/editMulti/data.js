function(e, ids, trigger, fieldNames) {

    fieldNames = fieldNames || [];

    return {
        fieldNames: fieldNames,
        hasFieldNames: fieldNames.length
    };
}