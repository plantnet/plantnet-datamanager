function(e) {
    var app = $$(this).app,
        utilsLib = app.getlib('utils');

    var step1Data = {
        direction: $(this).closest('form').find('input[name="direction"]:checked').val(),
        database: $('select#ex-url option:selected').val(),
        login: $('#db-login-name').val(),
        password: $('#db-login-passwd').val()
    };

    var isRemote = step1Data.database.substr(0,4) == 'http';

    if (isRemote && ((! step1Data.login) || (! step1Data.password))) {
        utilsLib.showWarning('You must enter your login and password to access a remote database');
    } else {
        $('#sync-wizard').trigger('step2', [step1Data]);
    }

    return false;
}