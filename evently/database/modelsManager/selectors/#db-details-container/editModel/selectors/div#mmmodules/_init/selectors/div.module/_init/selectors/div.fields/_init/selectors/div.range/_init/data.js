function() {
    var defaulValue = $(this).attr('data-default'),
        min = $(this).attr('data-min'),
        max = $(this).attr('data-max'),
        step = $(this).attr('data-step');
    
    return {
        default_value: defaulValue || '',
        min: min,
        max: max,
        step: step,
    };
};