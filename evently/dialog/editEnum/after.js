function() {

    var app = $$(this).app,
        utilsLib = app.getlib('utils');

    $('#edit-enum-modal').modal('show');

    utilsLib.hideBusyMsg('editEnum');

    $('textarea', this).focus();
}