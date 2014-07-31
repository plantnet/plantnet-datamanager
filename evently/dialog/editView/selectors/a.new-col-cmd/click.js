function(e) {
    // add a new col
    var app = $$(this).app,
        utilsLib = app.getlib('utils'),
        view = e.data.args[0],
        mm = e.data.args[1],
        unique = $('select#unique-field'),
        type = $(this).attr('data-type'),
        modi = $(this).attr('data-modi'),
        field = $(this).attr('data-field'),
        mmRefId = $(this).attr('data-mm-ref-id'),
        label = $(this).attr('data-label');

    // transform array
    var fields = field.split(',');
    if (fields.length > 1) {
        field = fields;
    }
    
    var column = {
        $modi: modi,
        field: field,
        label: label || field,
        type: type
    };
    if (mmRefId) {
        column.mm_ref_id = mmRefId;
    }

    view.$cols.push(column);
    utilsLib.showSuccess('Column added: "' + column.label + '"');

    $('#cols').trigger('_init', [view, mm]);
    unique.trigger('_init');

    return false;
}