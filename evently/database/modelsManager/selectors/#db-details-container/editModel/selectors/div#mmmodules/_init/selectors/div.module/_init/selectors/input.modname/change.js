function() {
    var mm = $$(this).app.data.mm,
        modt = $(this).parent().parent().attr('id');
    //modt = $(this).attr('data-modt');


    var valToSet = $(this).val();
    if (valToSet == '') {
        valToSet =  'no_name';
        $(this).val(valToSet);
    }


    mm.modules[modt].name = valToSet;
    var tabPos = $('#model-editor-modules-tabs li.active').index();
    $('#mmstructure').trigger('_init');
    $('#mmmodules').trigger('_init', { activateTab: tabPos });


    // if (mm.modules[modt]) {
    //     mm.modules[modt].name = valToSet;
    //     var tabPos = $('#model-editor-modules-tabs li.active').index();
    //     $('#mmstructure').trigger('_init');
    //     $('#mmmodules').trigger('_init', { activateTab: tabPos });
    // } else { // when the module is brand new, there is no mm.modules[modt] yet - just change the display
    //     $('#model-editor-modules-tabs li.active a').html(valToSet);
    // }
};
