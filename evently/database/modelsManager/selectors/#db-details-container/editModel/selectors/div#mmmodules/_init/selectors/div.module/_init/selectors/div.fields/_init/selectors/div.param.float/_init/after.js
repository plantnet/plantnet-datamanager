function() {
    var min = $('.float-values .float-min', this).val(),
        max = $('.float-values .float-max', this).val(),
        step = $('.float-values .float-step', this).val();
    
    $(this).parents('.field-infos').find('input[name="default_value"].float').attr('min', min);
    $(this).parents('.field-infos').find('input[name="default_value"].float').attr('max', max);
    $(this).parents('.field-infos').find('input[name="default_value"].float').attr('step', step);
    $(this).parents('.field-infos').find('input[name="default_value"].float').attr('placeholder', step);
};