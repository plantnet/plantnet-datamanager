function(e) {
    var app = $$(this).app,
        utilsLib = app.getlib('utils'),
        selectedOption = $('select#ex-url option:selected');

    var step1Data = {
        direction: $(this).closest('form').find('input[name="direction"]:checked').val(),
        database: {
            host: selectedOption.data('host'),
            port: selectedOption.data('port'),
            dbname: selectedOption.data('dbname')
        },
        login: $('#db-login-name').val(),
        password: $('#db-login-passwd').val()
    };

    var isRemote = step1Data.database.host != 'local';

    if (isRemote && ((! step1Data.login) || (! step1Data.password))) {
        utilsLib.showWarning('You must enter your login and password to access a remote database');
    } else {
        $('#sync-wizard').trigger('step2', [step1Data]);
    }

    return false;
}