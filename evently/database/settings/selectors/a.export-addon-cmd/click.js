function(evt) {
    var app = $$(this).app,
        utilsLib = app.getlib('utils'),
        key = $(this).attr('href').slice(1),
        addon = evt.data.args[2][key],
        mms = evt.data.args[3],
        mmId = $(this).prev('select').val(),
        func, url, mm;

    // find mm
    for (var i = 0; i < mms.length; i++) {
        if (mms[i]._id === mmId) {
            mm = mms[i];
            break;
        }
    }


    try {
        eval ('func = ' + addon);
    } catch (x) {
        utilsLib.showError('Error : cannot use addon.');
        return false;
    }

    try {
        url = func(app, mm);
    } catch (x) {
        utilsLib.showError('Error : ' + x);
        return false;
    }
    
    if (url) {
        window.location.href = url;
    }
    return false;
}