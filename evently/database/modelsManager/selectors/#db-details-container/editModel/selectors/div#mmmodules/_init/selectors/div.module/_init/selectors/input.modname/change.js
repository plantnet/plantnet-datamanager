function() {
    var mm = $$(this).app.data.mm,
        modt = $(this).parent().attr('id');

    mm.modules[modt].name = $(this).val();

    var tabPos = $('#model-editor-modules-tabs li.active').index();

    $('#mmstructure').trigger('_init');
    $('#mmmodules').trigger('_init', { activateTab: tabPos });
};