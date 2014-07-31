function (e, pathBinderParams) {
    var app = $$(this).app;
    var utilsLib = app.getlib('utils');
    if (utilsLib.checkOpenStructureEditor(app)) return false;
    utilsLib.clearBusyMsg();

    // Refresh/Actualize currentPath
    var infos = $$(this).app.infos;
    infos.view.id = null; // will be set after
    infos.model.activeView = 'table-view';
    infos.model.id = pathBinderParams.id;
    infos.module.instance.id = (pathBinderParams.modi[0] == '.' ? pathBinderParams.modi : null);
    infos.module.id = null;
    if (pathBinderParams.modi[0] == '*') {
        if (pathBinderParams.modi[1] == '.') { // query with reference modi
            infos.module.instance.id = pathBinderParams.modi.slice(1);
            infos.module.id = pathBinderParams.modi.slice(2);
        } else {
            infos.module.id = pathBinderParams.modi.slice(1);
        }
    }
    if (infos.module.instance.id && (! infos.module.id)) { // get modt from modi
        infos.module.id = utilsLib.modtFromModi(infos.module.instance.id);
    }
    if (pathBinderParams.filter_id && pathBinderParams.filter_id != '0' && pathBinderParams.filter_id.substr(0,7) != 'lucene:') { // over cracra
        infos.filter_id = pathBinderParams.filter_id;
    } else {
        infos.filter_id = null;
    }

    //$.log('mmid', infos.model.id, 'modt', infos.module.id, 'modi', infos.module.instance.id);

    // Refresh blocs
    $('#app-main-container').trigger('modelsManager');

    //$('#db-nav-container').trigger('_init');

    if ($('#model-content').length == 0) {
        var modelInfo = {
            mmId: infos.model.id
        };
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