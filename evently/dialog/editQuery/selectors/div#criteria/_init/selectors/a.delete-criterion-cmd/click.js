function (e) {

    var query = e.data.args[1];
    var mm = e.data.args[2];

    var row = $(this).closest('tr'),
        index = parseInt(row.attr('data-rowIndex'));

    query.$criteria.splice(index, 1);
    row.remove();
    $('#criteria').trigger('save', [query]);
    $('#criteria').trigger('_init', [query, mm]);

    return false;
}