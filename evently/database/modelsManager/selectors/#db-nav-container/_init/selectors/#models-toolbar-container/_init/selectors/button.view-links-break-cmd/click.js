function() {
    var mmId = $$(this).app.infos.model.id;
    $('#dialog-bloc').trigger('chooseRefField', mmId);

    return false;
}