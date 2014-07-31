function(e) {
    // add a new criteria
    var app = $$(this).app,
        utilsLib = app.getlib('utils'),
        query = e.data.args[0],
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

    // types having a default operator different from 'equals'
    var firstop = {
        text: 'contains',
        url: 'contains',
        longtext: 'contains',
        ref: 'contains',
        synonym: '-notempty'
    }; // @TODO should be centralized!

    var criterion = {
        $mod: mod, 
        field: field,
        label: label || field,
        type: type, 
        op: firstop[type] || 'equals',
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