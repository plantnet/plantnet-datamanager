function() {
    var min = $(this).val();
    $(this).parents('.field-infos').find('input[name="default_value"].float').attr('min', min);
};