function(e) {
    // add a new col
    var view = e.data.args[0],
        mm = e.data.args[1],
        option = $(this).find(':selected'),
        type = option.attr('data-type'),
        modi = option.attr('data-modi'),
        field = option.attr('data-field'),
        mmRefId = option.attr('data-mm-ref-id'),
        label = option.attr('data-label');

    if (! field) { // click on empty option
        return false;
    }

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

    $('#cols').trigger('_init', [view, mm]);
    return false;
}