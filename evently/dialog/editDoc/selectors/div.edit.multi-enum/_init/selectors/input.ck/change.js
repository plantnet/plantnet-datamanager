function() {
    var parent = $(this).closest('div'),
        values = [];
    $('input.ck:checked', parent).each(function() {
        values.push($(this).val());
    });
    $('input.editw', parent).val(values);
}