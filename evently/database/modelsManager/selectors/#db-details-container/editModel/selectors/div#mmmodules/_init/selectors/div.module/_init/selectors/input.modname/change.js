function() {
    var mm = $$(this).app.data.mm,
        modt = $(this).parent().attr('id');

    if (mm.modules[modt]) {
        mm.modules[modt].name = $(this).val();
        var tabPos = $('#model-editor-modules-tabs li.active').index();
        $('#mmstructure').trigger('_init');
        $('#mmmodules').trigger('_init', { activateTab: tabPos });
    } else { // when the module is brand new, there is no mm.modules[modt] yet - just change the display
        $('#model-editor-modules-tabs li.active a').html($(this).val());
    }
};