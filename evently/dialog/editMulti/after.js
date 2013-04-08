function() {

    var app = $$(this).app,
        utilsLib = app.getlib('utils');

    $('#edit-multi-modal').modal('show');

    utilsLib.hideBusyMsg('editMulti');
}