function(e) {
    var pwd = $('input[name="pwd"]', this).val(),
        pwd2 = $('input[name="pwd2"]', this).val(),
        email = $('input[name="email"]', this).val();
    $(this).trigger('doChPwd', [pwd, pwd2, email]);
    $('#change-pwb-modal').modal('hide');
    return false;
};