function (e, pathBinderParams) {

    // Refresh/Actualise currentPath
    var infos = $$(this).app.infos;
    infos.model.activeView = 'export-view';
    infos.model.id = pathBinderParams.mmId;
    
    // Refresh blocs
    if ($('#db-details-container').length == 0) {
        $('#app-main-container').trigger('modelsManager');
    }

    $('#db-details-container').trigger('export', pathBinderParams);
    $('#models-toolbar-container').trigger('_init'); // @TODO do not do it everytime: when reloading app, toolbar is triggered twice!

    // Breadcrumbs management
    breadcrumbData = {trail: [{
        name: 'Model', 
        has_icon: true,
        icon_class: 'icon-dm-model',
        has_next: true
    },{
        name: 'Export', 
        has_icon: true,
        icon_class: 'icon-dm-model-import',
        has_next: false
    }]};
    $('#breadcrumb-container').trigger('_init', breadcrumbData);
}