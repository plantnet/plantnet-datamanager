function(e) {
    // add a new criteria
    var query = e.data.args[0],
        mm = e.data.args[1],
        type = $(this).attr('data-type'),
        mod = $(this).attr('data-modi'),
        field = $(this).attr('data-field'),
        mm_ref_id = $(this).attr('data-mm-ref-id'),
        label = $(this).attr('data-label');
    
    // if ref
    var fields = field.split(',');
    if (fields.length > 1) {
        field = fields;
    }
    
    var criterion = {
        $mod: mod, 
        field: field,
        label: label || field,
        type: type, 
        op: '==',
        value: ''
    };
    if (mm_ref_id) {
        criterion.mm_ref_id = mm_ref_id;
    }

    query.$criteria.push(criterion);

    $('#criteria').trigger('save', [query]);
    $('#criteria').trigger('_init', [query, mm]);
    return false;
}