function(e) {
    var name = $('input[name="name"]', this).val(),
        pass = $('input[name="password"]', this).val(),
        email = $('input[name="email"]', this).val();
    $(this).trigger('doSignup', [name, pass, email]);
    $('#signup-modal').modal('hide');
    return false;
};