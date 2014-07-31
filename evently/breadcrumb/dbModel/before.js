function(e, pathBinderParams) {
    //$.log('Pathbinder : dbModel');
    //$.log('Pathbinder params : ', pathBinderParams);
    var app = $$(this).app,
        utilsLib = app.getlib('utils');
    if (utilsLib.checkOpenStructureEditor(app)) return false;
    utilsLib.clearBusyMsg();

    // Refresh/Actualise app infos
    var infos = $$(this).app.infos;
    infos.model.activeView = 'table-view';
    infos.model.id = pathBinderParams.mmId;
    infos.model.name = pathBinderParams.mmName;

    // Refresh blocs
    if ($('#db-details-container').length == 0) {
        $('#app-main-container').trigger('modelsManager');
    }
    
    $('#models-toolbar-container').trigger('_init');
    $('#db-details-container').trigger('dbModel', pathBinderParams);
    
    // Breadcrumbs management
    breadcrumbData = {
        name: 'Model ' + pathBinderParams.mmName, 
        has_icon: true,
        icon_class: 'icon-dm-model',
        has_next: false
    };
    $('#breadcrumb-container').trigger('_init', breadcrumbData);
}