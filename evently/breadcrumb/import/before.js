function (e, pathBinderParams) {
    //$.log('Pathbinder : import');
    //$.log('Pathbinder params : ', pathBinderParams);
    var app = $$(this).app,
        utilsLib = app.getlib('utils');
    if (utilsLib.checkOpenStructureEditor(app)) return false;

    // Refresh/Actualise currentPath
    var infos = $$(this).app.infos;
    infos.model.activeView = 'import-view';
    infos.model.id = pathBinderParams.mmId;
    $.log('Current model id : ' + infos.model.id);

    // Refresh blocs
    if ($('#db-details-container').length == 0) {
        $('#app-main-container').trigger('modelsManager');
    }

    $('#db-details-container').trigger('import', pathBinderParams);
    $('#models-toolbar-container').trigger('_init'); // @TODO do not do it everytime: when reloading app, toolbar is triggered twice!

    // Breadcrumbs management
    breadcrumbData = {trail: [{
        name: 'Model', 
        has_icon: true,
        icon_class: 'icon-dm-model',
        has_next: true
    },{
        name: 'Import', 
        has_icon: true,
        icon_class: 'icon-dm-model-import',
        has_next: false
    }]};
    $('#breadcrumb-container').trigger('_init', breadcrumbData);
}