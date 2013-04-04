function(evt) {
    var app = $$(this).app,
        utilsLib = app.getlib('utils'),
        files = evt.target.files, // FileList object
        reader = new FileReader(),
        key = $(this).attr('id'),
        addons = evt.data.args[2],
        param = $(this).closest('li').find('input.param').first().val(),
        func;

    try {
        eval('func = ' + addons[key]);
    } catch (x) {
        utilsLib.showError('Error : cannot use addon.');
        return;
    }

    function onError(err) {
        $('#busy-modal').modal('hide');
        $.pathbinder.begin();
        utilsLib.showError(err);
    }

    function onSuccess(a) {
        $('#busy-modal').modal('hide');
        utilsLib.showSuccess('Data imported (' + a.length + ' docs).');
    }

    var filename;
    reader.onload = function(e) {
        var data;
        try {
            $.log('Plugin param :' + param);
            func(app, app.db, filename, e.target.result, param, onSuccess, onError);
        } catch (x) {
            onError('Cannot parse dump data : ' + x);
            return;
        }
    };
        
    // Read in the image file as a data URL.
    if (files.length > 0) {
        filename = files[0].name;
        $('#dialog-bloc').trigger('busy', 'Importing data...');
        $('#busy-modal').modal('show');
        reader.readAsText(files[0]);
    }
}