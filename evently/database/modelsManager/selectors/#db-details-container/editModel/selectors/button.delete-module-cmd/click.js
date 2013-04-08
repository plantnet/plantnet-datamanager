function () {
    //remove module
    var app = $$(this).app,
        mm = app.data.mm,
        utilsLib = app.getlib('utils'),
        activeTab = $('#model-editor-modules-tabs').find('li.active'),
        activeTabContents = $('#model-editor-modules').find('div.tab-pane.active');

    var modt = activeTab.find('a').attr('href').slice(1);

    for (var modi in mm.structure) {
        if (mm.structure[modi][0] === modt) {
            utilsLib.showWarning('Cannot remove used module. Please remove it in "structure" first');
            return false;
        }
    }

    delete(mm.modules[modt]);

    activeTab.remove();
    activeTabContents.remove();
    // refresh view
    $('#mmstructure').trigger('_init');
    $('#mmmodules').trigger('_init');

    return false;
};