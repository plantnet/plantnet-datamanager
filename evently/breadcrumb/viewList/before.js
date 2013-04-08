function(e, pathBinderParams) {
    var app = $$(this).app,
        utilsLib = app.getlib('utils');
    if (utilsLib.checkOpenStructureEditor(app)) return false;
    
    // Refresh/Actualise currentPath
    var idUrl = pathBinderParams.id;
        //typeList = pathBinderParams.action,
        //modeleDocSeparatorIndex = idUrl.indexOf('##'),
        //infos = $$(this).app.infos;
    
    breadcrumbData = {
        name: 'List view', 
        has_icon: true,
        icon_class: 'icon-dm-view-list',
        has_next: false
    };

    $('#breadcrumb-container').trigger('_init', breadcrumbData);
    $('#app-main-container').trigger('viewList', pathBinderParams);
}