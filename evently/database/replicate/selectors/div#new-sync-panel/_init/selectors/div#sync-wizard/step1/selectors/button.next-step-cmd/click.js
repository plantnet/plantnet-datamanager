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
        return false;
    }

    if (isRemote) {
        // test remote server access
        utilsLib.admin_db(app.db, 'call_remote', {}, {
            host: step1Data.database.host.slice(7), // remove http://
            port: step1Data.database.port,
            db: step1Data.database.dbname,
            username: step1Data.login,
            password: step1Data.password,
            remoteAction: 'get_structures'
        }, function(data) {
            end();
        }, function(error) {
            //$.log('erre', error);
            var errMsg= 'Could not connect to host. Wrong login / password?';
            utilsLib.showWarning(errMsg);
            end();
            return false;
        });
    } else {
        end();
    }

    function end() {
        $('#sync-wizard').trigger('step2', [step1Data]);
        return false;
    }

    return false;
}