function() {
    var min = $(this).val();
    $(this).parents('tr').find('.default-value-range').attr('min', min);
    $(this).parents('tr').find('.input-range-min').text(min);
};