function() {
    var app = $$(this).app,
        utilsLib = app.getlib('utils'),
        ck = $('.doc-container input.ck:checked');

    if (ck.length != 1) {
        utilsLib.showWarning('Please select only one doc');
    } else {
        var id = ck.val(),
        lonlat = ck.data('lonlat'),
        label = ck.data('label');

        if (!lonlat) {
            utilsLib.showError('No geolocation to display.');
            return false;
        }

        ck.attr('checked', false);

        if (id) {
            $("#dialog-bloc").trigger("showMap", [id, lonlat, label]);
        }
    }
    return false;
}