function() {

    var app = $$(this).app,
        utilsLib = app.getlib('utils'),
        htmlLib = app.getlib('html');

    htmlLib.indent();

    $('#edit-view-modal').modal({ backdrop: 'static' });
    var alreadyLoaded = false;
    $('#edit-view-modal').on('shown', function() {
        if (! alreadyLoaded) {
            $('input[name="name"]', this).focus();
            alreadyLoaded = true;
        }
    });

    utilsLib.hideBusyMsg('editView');
}