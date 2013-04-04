function() {
    var step = $(this).val();
    $(this).parents('.field-infos').find('input[name="default_value"].float').attr('step', step);
    $(this).parents('.field-infos').find('input[name="default_value"].float').attr('placeholder', step);
};