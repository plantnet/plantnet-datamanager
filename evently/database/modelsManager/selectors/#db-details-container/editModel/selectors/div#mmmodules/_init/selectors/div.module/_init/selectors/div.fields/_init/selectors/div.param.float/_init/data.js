function() {
    var min = $(this).attr('data-min'),
        max = $(this).attr('data-max'),
        step = $(this).attr('data-step') || 0.0001;
    
    return {
        min: min,
        max: max,
        step: step
    };
};