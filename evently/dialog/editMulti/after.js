function() {

    var app = $$(this).app,
        utilsLib = app.getlib('utils');

    $('#edit-multi-modal').modal({ backdrop: 'static' });

    utilsLib.hideBusyMsg('editMulti');
}