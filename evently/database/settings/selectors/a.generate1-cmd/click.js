function() {
    var app = $$(this).app,
        utilsLib = app.getlib('utils'),
        generateLib = app.require('tests/generate');
    
    utilsLib.showBusyMsg('Generating test data for the database...', 'generateTestData');
    
    function onSuccess() {
        utilsLib.showSuccess('Data generated.');
        utilsLib.hideBusyMsg('generateTestData');
    }

    function onError(e) {
        utilsLib.showError('Example data may already be present.');
        $.log('Error generate test data :' + e);
        utilsLib.hideBusyMsg('generateTestData');
    }

    generateLib.generate_data_bota(app, function() {
        app.db.dm('check_data', null, null, onSuccess);
    }, onError);
    return false;
}