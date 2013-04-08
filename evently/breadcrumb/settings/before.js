function() {
    var app = $$(this).app,
        utilsLib = app.getlib('utils');
    if (utilsLib.checkOpenStructureEditor(app)) return false;

    breadcrumbData = [{
        name: 'Settings', 
        has_icon: true,
        icon_class: 'icon-dm-db-settings',
        has_next: false
    }];
    $('#breadcrumb-container').trigger('_init', breadcrumbData);
    
    $('#app-main-container').trigger('settings');
}