function(e) {
    // add a new criteria on a different level of a referenced dictionary
    var app = $$(this).app,
        utilsLib = app.getlib('utils'),
        query = e.data.args[0],
        mm = e.data.args[1],
        opt = $(this).find('option:selected'),
        type = opt.attr('data-type'),
        mod = opt.attr('data-modi'),
        field = opt.attr('data-field'),
        mm_ref_id = opt.attr('data-mm-ref-id'),
        label = opt.attr('data-label');

    // if ref
    var fields = field.split(',');
    if (fields.length > 1) { // should be == 4, no?
        field = fields;
    }

    var criterion = {
        $mod: mod, 
        field: field,
        label: label || field,
        type: type, 
        op: '==', // @TODO should be the first operator for the given type
        value: ''
    };
    if (mm_ref_id) {
        criterion.mm_ref_id = mm_ref_id;
    }

    query.$criteria.push(criterion);
    utilsLib.showSuccess('Criterion added');

    $('#criteria').trigger('save', [query]);
    $('#criteria').trigger('_init', [query, mm]);
    return false;
}