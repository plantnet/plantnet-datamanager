function() {
    //$.log('Pathbinder : dbManager');

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