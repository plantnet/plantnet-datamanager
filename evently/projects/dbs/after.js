function() {
    var app = $$(this).app,
        utilsLib = app.getlib('utils');

    utilsLib.hideBusyMsg('databases');

    $('div.check-for-update').trigger('load');
}