function(e, pathBinderParams) {
    //$.log('Pathbinder : replicate');
    //$.log('Pathbinder params : ', pathBinderParams);
    
    breadcrumbData = [{
        name: 'Data synchronization', 
        has_icon: true,
        icon_class: 'icon-dm-db-sync',
        has_next: false
    }];
    $('#breadcrumb-container').trigger('_init', breadcrumbData);
    
    $('#app-main-container').trigger('replicate', pathBinderParams);
}