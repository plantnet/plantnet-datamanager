function(e, pathBinderParams) {
    //$.log('Pathbinder : images');
    //$.log('Pathbinder params : ', pathBinderParams);
    var app = $$(this).app,
        utilsLib = app.getlib('utils');
    if (utilsLib.checkOpenStructureEditor(app)) { return; }

    // Refresh/Actualise app infos
    var infos = $$(this).app.infos;
    infos.model.activeView = 'images-view';
    infos.model.id = pathBinderParams.mmId;
    infos.module.id = null;
    infos.module.instance.id = null;
    if (pathBinderParams.type == 'modt') {
        infos.module.id = pathBinderParams.id;
    } else if (pathBinderParams.type == 'modi') {
        infos.module.instance.id = pathBinderParams.id;
    }
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
        var modelInfo = {mmId: infos.model.id};
        $('#db-details-container').trigger('dbModel', modelInfo);
    }
    $('#model-content').trigger('images', pathBinderParams);
    $('#model-menu').trigger('_init');

    // Breadcrumbs management
    breadcrumbData = {trail: [{
        name: 'Model', 
        has_icon: true,
        icon_class: 'icon-dm-model',
        has_next: true
    },{
        name: 'Image view ', 
        has_icon: true,
        icon_class: 'icon-dm-pictures',
        has_next: false
    }]};
    $('#breadcrumb-container').trigger('_init', breadcrumbData);
}