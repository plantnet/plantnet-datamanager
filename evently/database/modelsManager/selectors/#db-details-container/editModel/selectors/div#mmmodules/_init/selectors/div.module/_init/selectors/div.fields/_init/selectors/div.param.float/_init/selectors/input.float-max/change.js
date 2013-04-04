function() {
    var max = $(this).val();
    $(this).parents('.field-infos').find('input[name="default_value"].float').attr('max', max);
};