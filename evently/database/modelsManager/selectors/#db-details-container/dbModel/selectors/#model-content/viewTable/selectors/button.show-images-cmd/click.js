function() {
    var app = $$(this).app,
        utilsLib = app.getlib('utils'),
        ck = $('table.data input.ck:checked');

    if (ck.length == 0) {
        utilsLib.showWarning('Please select at least one doc');
    } else {
        if (ck.length == 1) { // for one doc: images and children images
            var id = ck.val(),
            mm_id = ck.data("mm-id");
            if (mm_id) {
                mm_id = app.libs.utils.encode_design_id(mm_id);
                ck.attr('checked', false);
                if (id) {
                    $.pathbinder.go("/images/" + mm_id + "/0/parent/" + id);
                }
            } else {
                customGallery(); // if mm is not available (in views for example) do as for multiple docs
            }
        } else { // for multiple docs: go to gallery
            customGallery();
        }
    }
    return false;

    function customGallery() {
        var idsList = [];
        ck.each(function() {
            idsList.push($(this).val());
        });
        // Refresh/Actualise app infos
        var infos = app.infos;
        infos.model.activeView = 'images-view';
        infos.module.id = null;
        infos.module.instance.id = null;
        infos.filter_id = null;
        infos.filter_id = null;
        infos.view.id = null;
        infos.view.name = null;
        // a fake step forward to enable "back" button
        $.pathbinder.go('/step');
        // feed breadcrumb
        breadcrumbData = {trail: [{
            name: 'Model', 
            has_icon: true,
            icon_class: 'icon-dm-model',
            has_next: true
        },{
            name: 'Image view ', 
            has_icon: true,
            icon_class: 'icon-dm-pictures',
            has_next: false
        }]};
        $('#breadcrumb-container').trigger('_init', breadcrumbData);
        // load map view
        $('#models-toolbar-container').trigger('_init');
        $('#model-content').trigger('images', {
            //mmId: infos.model.id,
            idsList: idsList
        });
    }
}