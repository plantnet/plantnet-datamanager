function(e) {

    var app = $$(this).app,
        infos = app.infos,
        mmId = infos.model.id;

    $('#dialog-bloc').trigger('editQuery', [mmId, null, null]);

    return false;
}