function() {
    //$.log('Pathbinder : dbHome');
    var app = $$(this).app,
        utilsLib = app.getlib('utils');
    if (utilsLib.checkOpenStructureEditor(app)) return false;
    utilsLib.clearBusyMsg();

    // Refresh/Actualise app infos
    var infos = $$(this).app.infos;
    infos.model.activeView = '';
    infos.model.id = '';
    infos.model.name = '';
    infos.currentPath = 'dbHome';
    
    breadcrumbData = false;
    $('#breadcrumb-container').trigger('_init', breadcrumbData);
    
    if ($('#db-details-container').length == 0) {
        $('#app-main-container').trigger('modelsManager');
    }
    
    $('#models-toolbar-container').trigger('_init');
    $('#db-details-container').trigger('dbHome');
    $('.nav-tabs .active a').tab('show');
}