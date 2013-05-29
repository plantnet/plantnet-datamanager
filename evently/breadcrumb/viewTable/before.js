function (e, pathBinderParams) {
    var app = $$(this).app;
    var utilsLib = app.getlib('utils');
    if (utilsLib.checkOpenStructureEditor(app)) return false;

    // Refresh/Actualize currentPath
    var infos = $$(this).app.infos;
    infos.model.activeView = 'table-view';
    infos.model.id = pathBinderParams.id;
    infos.module.instance.id = (pathBinderParams.modi[0] == '.' ? pathBinderParams.modi : null);
    infos.module.id = (pathBinderParams.modi[0] == '*' ? pathBinderParams.modi : null); // modt
    if (pathBinderParams.filter_id && pathBinderParams.filter_id != '0' && pathBinderParams.filter_id.substr(0,7) != 'lucene:') { // over cracra
        infos.filter_id = pathBinderParams.filter_id;
    } else {
        infos.filter_id = null;
    }

    // Refresh blocs
    $('#app-main-container').trigger('modelsManager');

    $('#models-toolbar-container').trigger('_init');
    
    if ($('#model-content').length == 0) {
        var modelInfo = {mmId: infos.model.id};
        $('#db-details-container').trigger('dbModel', modelInfo);
    }
    $('#model-content').trigger('viewTable', pathBinderParams);
    
    // Breadcrumbs management
    breadcrumbData = {trail: [{
        name: 'Model', 
        has_icon: true,
        icon_class: 'icon-dm-model',
        has_next: true
    },{
        name: 'Table view ', 
        has_icon: true,
        icon_class: 'icon-dm-view-table',
        has_next: false
    }]};
    $('#breadcrumb-container').trigger('_init', breadcrumbData);
}