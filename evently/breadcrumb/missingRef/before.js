function(e, pathBinderParams) {
    //$.log('Pathbinder : missingRef');
    //$.log('Pathbinder params : ', pathBinderParams);
    var app = $$(this).app,
        utilsLib = app.getlib('utils');
    if (utilsLib.checkOpenStructureEditor(app)) return false;

    // Refresh/Actualise currentPath
    var infos = $$(this).app.infos;
    infos.model.activeView = 'missing-ref-view';
    infos.model.id = pathBinderParams.mmId;
    infos.module.id = null;
    infos.module.instance = {}

    // Check activation block
    if ($('#db-details-container').length == 0) {
        $('#app-main-container').trigger('modelsManager');
    }

    $('#db-details-container').trigger('missingRef', pathBinderParams);

    // Breadcrumbs management
    breadcrumbData = {trail: [{
        name: 'Model', 
        has_icon: true,
        icon_class: 'icon-dm-model',
        has_next: true
    },{
        name: 'Missing references', 
        has_icon: true,
        icon_class: 'icon-dm-link-break',
        has_next: false
    }]};
    $('#breadcrumb-container').trigger('_init', breadcrumbData);;
}