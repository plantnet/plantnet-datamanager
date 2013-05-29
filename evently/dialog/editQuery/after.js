function() {

    var app = $$(this).app;
    var utilsLib = app.getlib('utils'),
        htmlLib = app.getlib('html');

    htmlLib.indent();

    var modi = $('select#modi');
    if (modi.val()) {
        var modt = $('select#modt');
        modt.val('');
    }

    $('#edit-query-modal').modal({ backdrop: 'static' });
    var alreadyLoaded = false;
    $('#edit-query-modal').on('shown', function() {
        if (! alreadyLoaded) {
            $('input[name="name"]', this).focus();
            alreadyLoaded = true;
        }
    });

    utilsLib.hideBusyMsg('editQuery');
}