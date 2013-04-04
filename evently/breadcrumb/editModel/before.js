function(e, pathBinderParams) {
    //$.log('Pathbinder : editModel (editMM)');
    //$.log('Pathbinder params : ', pathBinderParams);
    
    // Refresh/Actualize app infos
    var infos = $$(this).app.infos;
    infos.model.activeView = 'edit-model-view';
    infos.model.id = pathBinderParams.mmId;

    // Breadcrumbs management
    breadcrumbData = {trail: [{
        name: 'Model', 
        has_icon: true,
        icon_class: 'icon-dm-model',
        has_next: true
    },{
        name: 'Edit structure', 
        has_icon: true,
        icon_class: 'icon-dm-model-edit',
        has_next: false
    }]};
    $('#breadcrumb-container').trigger('_init', breadcrumbData);

    // Check activation of blocks
    if ($('#db-details-container').length == 0) {
        $('#app-main-container').trigger('modelsManager');
    }

    $('#db-details-container').trigger('editModel', pathBinderParams);
    $('#models-toolbar-container').trigger('_init'); // @TODO do not do it everytime: when reloading app, toolbar is triggered twice!

    $('#db-details-container .nav-tabs .active a').tab('show');
}


