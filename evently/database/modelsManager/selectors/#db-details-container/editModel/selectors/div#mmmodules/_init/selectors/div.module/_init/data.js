function() {
    var app = $$(this).app,
        mm = app.data.mm,
        modt = $(this).attr('id'),
        module = mm.modules[modt],
        color = $(this).data('color');

    if (!module.label_tpl && module.index_tpl) {
        module.label_tpl = module.index_tpl;
        delete module.index_tpl;
    }

    return {
        module: module,
        _id:  modt,
        color: color
    };
};