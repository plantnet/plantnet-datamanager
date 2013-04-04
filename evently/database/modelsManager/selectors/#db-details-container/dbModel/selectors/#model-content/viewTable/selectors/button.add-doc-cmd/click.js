function() {
    var infos = $$(this).app.infos;
    
    var mmId = infos.model.id,
        modI = infos.module.instance.id,
        newParam = {
            parent: undefined,
            mm_id: '_design/' + mmId,
            modi: modI
        };

    $('#dialog-bloc').trigger('editDoc', [undefined, newParam]);

    return false;
}