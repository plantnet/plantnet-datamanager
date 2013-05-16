function() {
    var host = $(this).find('option:selected').data('host'),
        login = $('#remote-db-login'),
        input = $('#db-login-name');

    if (host) {
        if (host == 'local') {
            login.hide();
            input.removeAttr('required');
        } else {
            login.show();
            input.attr('required', 'required');
        }
    }
}