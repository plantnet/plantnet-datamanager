function() {
    $.log('Dans input.range-max > change.js');
    var step = $(this).val();
    $(this).parents('tr').find('.default-value-range').attr('step', step);
};