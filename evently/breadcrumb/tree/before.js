function(e, pathBinderParams) {
    var app = $$(this).app,
        utilsLib = app.getlib('utils');
    if (utilsLib.checkOpenStructureEditor(app)) return false;

    // Refresh/Actualise app infos
    var infos = $$(this).app.infos;
    infos.model.activeView = 'tree-view';
    infos.model.id = pathBinderParams.mmId;
    infos.module.id = null;
    infos.module.instance.id = null;
    infos.filter_id = null;
    infos.view.id = null;
    infos.view.name = null;

    // Refresh blocs
    $('#app-main-container').trigger('modelsManager');

    if ($('#model-content').length == 0) {
        var modelInfo = {mmId: infos.model.id};
        $('#db-details-container').trigger('dbModel', modelInfo);
    }
    $('#model-content').trigger('tree', pathBinderParams);

    // Breadcrumbs management
    breadcrumbData = {trail: [{
        name: 'Model',
        has_icon: true,
        icon_class: 'icon-dm-model',
        has_next: true
    },{
        name: 'Tree view ', 
        has_icon: true,
        icon_class: 'icon-dm-view-tree',
        has_next: false
    }]};
    $('#breadcrumb-container').trigger('_init', breadcrumbData);
}