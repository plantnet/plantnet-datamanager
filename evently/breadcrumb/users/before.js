function() {
    //$.log('Pathbinder : projects > users');
    
    // Refresh/Actualise app infos
    var infos = $$(this).app.infos;
    infos.currentPath = 'users';
    
    // Breadcrumbs management
    breadcrumbData = {
        name: 'Manage users', 
        has_icon: true,
        icon_class: 'icon-dm-user-manager',
        has_next: false
    };
    $('#breadcrumb-container').trigger('_init', breadcrumbData);
    
    $('#app-main-container').trigger('users');
}