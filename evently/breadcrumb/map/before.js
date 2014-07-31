function(e, pathBinderParams) {
    //$.log('Pathbinder : map');
    //$.log('Pathbinder params : ', pathBinderParams);
    var app = $$(this).app,
        utilsLib = app.getlib('utils');
    if (utilsLib.checkOpenStructureEditor(app)) { return; }
    utilsLib.clearBusyMsg();

    // Refresh/Actualise app infos
    var infos = $$(this).app.infos;
    infos.model.activeView = 'map-view';
    infos.model.id = pathBinderParams.mmId;
    infos.module.id = null;
    infos.module.instance.id = null;
    infos.filter_id = null;
    infos.filter_id = null;
    infos.view.id = null;
    infos.view.name = null;

    // Refresh blocs
    if ($('#db-details-container').length == 0) {
        $('#app-main-container').trigger('modelsManager');
    }

    $('#models-toolbar-container').trigger('_init');

    if ($('#model-content').length == 0) {
        var modelInfo = {
            mmId: infos.model.id
        };
        $('#db-details-container').trigger('dbModel', modelInfo);
    }

    $('#model-content').trigger('map', pathBinderParams);
    $('#model-menu').trigger('_init');

    // Breadcrumbs management
    breadcrumbData = {trail: [{
        name: 'Structure', 
        has_icon: true,
        icon_class: 'icon-dm-model',
        has_next: true
    },{
        name: 'Map view ', 
        has_icon: true,
        icon_class: 'icon-dm-map',
        has_next: false
    }]};
    $('#breadcrumb-container').trigger('_init', breadcrumbData);
}