function(e, doc, mm) {
    var fieldName = $(this).attr('data-name'),
        index = $(this).attr('data-index'),
        value = doc[fieldName],
        mmId = mm._id,
        refId = (doc.$ref && doc.$ref[fieldName]) ? doc.$ref[fieldName]._id : '';

    if (fieldName[0] !== '$') {
        mmId = mm.modules[doc.$modt].fields[index].mm;
    }

    if (!mmId) {
        throw new Error('not a ref field');
    }

    return {
        name: fieldName,
        value: value,
        mm_id: mmId,
        mm_id_no_design: mmId.slice(8),
        ref_id: refId,
        force_eoo: mm.modules[doc.$modt].fields[index].force_eoo
    };
}