function() {
    var url = $(this).val(),
        login = $('#remote-db-login'),
        input = $('#db-login-name');

    if (url) {
        if (url.slice(0,8) === 'local://') {
            login.hide();
            input.removeAttr('required');
        } else {
            login.show();
            input.attr('required', 'required');
        }
    }
}