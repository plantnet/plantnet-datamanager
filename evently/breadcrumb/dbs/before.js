function() {
    //$.log('Pathbinder : projects > dbs');

    // Refresh/Actualise app infos
    var infos = $$(this).app.infos;
    infos.currentPath = 'dbs';

    breadcrumbData = false;
    $('#breadcrumb-container').trigger('_init', breadcrumbData);

    $('#app-main-container').trigger('dbs');
}