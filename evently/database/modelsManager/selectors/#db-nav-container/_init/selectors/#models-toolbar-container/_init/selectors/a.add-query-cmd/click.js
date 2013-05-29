function(e) {

    var app = $$(this).app;
    var infos = app.infos,
        mmId = infos.model.id;

    $('#dialog-bloc').trigger('editQuery', [mmId, null, null]);

    return false;
}