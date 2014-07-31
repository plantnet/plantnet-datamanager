function() {
    var max = $(this).val();
    $(this).parents('tr').find('.default-value-range').attr('max', max);
    $(this).parents('tr').find('.input-range-max').text(max);
};