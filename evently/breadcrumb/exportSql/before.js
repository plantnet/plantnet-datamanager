function (e, pathBinderParams) {
    //$.log('Pathbinder : exportSql');
    //$.log('Pathbinder params : ', pathBinderParams);
    var app = $$(this).app,
        utilsLib = app.getlib('utils');
    if (utilsLib.checkOpenStructureEditor(app)) return false;
    
    breadcrumbData = [{
        name: 'Export SQL', 
        has_icon: true,
        icon_class: 'icon-dm-db-export',
        has_next: false
    }];
    $('#breadcrumb-container').trigger('_init', breadcrumbData);
    
    $('#app-main-container').trigger('exportSql', pathBinderParams);
}
