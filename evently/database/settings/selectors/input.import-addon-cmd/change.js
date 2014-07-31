function(evt) {
    var app = $$(this).app,
        utilsLib = app.getlib('utils'),
        files = evt.target.files, // FileList object
        reader = new FileReader(),
        key = $(this).attr('id'),
        addons = evt.data.args[2],
        mms = evt.data.args[3],
        mm,
        mmId = $(this).closest('li').find('select').val(),
        param = $(this).closest('li').find('input.param').first().val(),
        func;

    // find mm
    if (mmId) {
        for (var i = 0; i < mms.length; i++) {
            if (mms[i]._id === mmId) {
                mm = mms[i];
                break;
            }
        }
    }

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
            app.data.lock_changes = Date.now() + 360000; // porky
            func(app, app.db, filename, e.target.result, mm, param, onSuccess, onError);
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