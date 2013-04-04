function(evt) {
    var app = $$(this).app,
        utilsLib = app.getlib('utils');
        files = evt.target.files, // FileList object
        reader = new FileReader();

    function onError(err) {
        utilsLib.showError(err);
    }

    function onSuccess(a) {
        utilsLib.showSuccess('Data imported (' + a.length + ' docs).');
    }

    reader.onload = function(e) {
        try {
            //$.log('e.target.result', e.target.result);
            var data = JSON.parse(e.target.result);
            //$.log('data', data);
            if (! utilsLib.is_array(data)) {
                if (data.rows && utilsLib.is_array(data.rows)) {
                    data = data.rows;
                } else {
                    data = [data];
                }
            }
            data = data.map(function(e) {
                delete e._rev;
                return e;
            });
            app.db.bulkSave({'docs': data, 'all_or_nothing': true}, {
                success: onSuccess,
                error: onError
            });
        } catch (x) {
            onError('Cannot parse dump data ' + x);
            return;
        }
    };

    // Read in the image file as a data URL.
    if (files.length > 0) {
        reader.readAsText(files[0]);
    }
}