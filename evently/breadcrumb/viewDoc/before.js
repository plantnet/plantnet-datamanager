function (e, pathBinderParams) {
    var app = $$(this).app,
        utilsLib = app.getlib('utils');
    if (utilsLib.checkOpenStructureEditor(app)) return false;
    //$.log('Pathbinder : viewDoc');
    //$.log('Pathbinder params : ', pathBinderParams);

    // Refresh currentPath
    var infos = $$(this).app.infos;
    infos.model.activeView = null;
    infos.model.id = pathBinderParams.id.slice(0, pathBinderParams.id.indexOf('##'));
    infos.module.id = null;
    infos.module.instance.id = null;
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
    $('#model-content').trigger('viewDoc', pathBinderParams);
    $('#model-menu').trigger('_init');

    // Breadcrumbs management
    breadcrumbData = {trail: [{
        name: 'Model', 
        has_icon: true,
        icon_class: 'icon-dm-model',
        has_next: true
    },{
        name: 'Doc view ', 
        has_icon: true,
        icon_class: 'icon-dm-model',
        has_next: false
    }]};
    $('#breadcrumb-container').trigger('_init', breadcrumbData);
    $('.has-tooltip').tooltip("hide");
}