function(e) {
    var name = $('input[name="name"]', this).val(),
        pass = $('input[name="password"]', this).val(),
        passconf = $('input[name="password-conf"]', this).val(),
        email = $('input[name="email"]', this).val();

    $(this).trigger('doSignup', [name, pass, passconf, email]);

    $('#signup-modal').modal('hide');

    return false;
};