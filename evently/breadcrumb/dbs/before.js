function() {
    //$.log('Pathbinder : projects > dbs');
    var app = $$(this).app,
        utilsLib = app.getlib('utils');
    if (utilsLib.checkOpenStructureEditor(app)) return false;

    // Refresh/Actualise app infos
    var infos = $$(this).app.infos;
    infos.currentPath = 'dbs';

    breadcrumbData = false;
    $('#breadcrumb-container').trigger('_init', breadcrumbData);

    $('#app-main-container').trigger('dbs');
}