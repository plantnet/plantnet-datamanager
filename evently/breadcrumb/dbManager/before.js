function() {
    //$.log('Pathbinder : dbManager');
    var app = $$(this).app,
        utilsLib = app.getlib('utils');
    if (utilsLib.checkOpenStructureEditor(app)) return false;

    // Refresh/Actualise app infos
    var infos = $$(this).app.infos;
    infos.model.activeView = '';
    infos.model.id = '';
    infos.model.name = '';
    infos.currentPath = 'dbManager';
    
    breadcrumbData = false;
    $('#breadcrumb-container').trigger('_init', breadcrumbData);
    
    $('#app-main-container').trigger('modelsManager');
    $('#db-details-container').trigger('dbHome');
}