function() {
    var value = $(this).val(),
        min = $(this).attr('min'),
        max = $(this).attr('max');
    $(this).parent().find('.input-range-value').text(value);
    $(this).parent().find('.input-range-min').text(min); // wtf?
    $(this).parent().find('.input-range-max').text(max); // wtf?
};