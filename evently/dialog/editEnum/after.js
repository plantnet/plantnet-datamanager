function() {

    var app = $$(this).app,
        utilsLib = app.getlib('utils');

    $('#edit-enum-modal').modal({ backdrop: 'static' });

    utilsLib.hideBusyMsg('editEnum');

    $('textarea', this).focus();
}