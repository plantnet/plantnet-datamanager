function(e) {

    var app = $$(this).app,
        infos = app.infos;

    var mmId = infos.model.id,
        modI = $(this).data('modi'),
        newParam = {
            parent: undefined,
            mm_id: '_design/' + mmId,
            modi: modI
        };

    $('#dialog-bloc').trigger('editDoc', [undefined, newParam]);

    return false;
}