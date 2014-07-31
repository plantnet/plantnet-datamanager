function() {
    var app = $$(this).app,
        utilsLib = app.getlib('utils'),
        ck = $('div.doc-list input.ck:checked');

    if (ck.length == 0) {
        utilsLib.showWarning('Please select at least one doc');
    } else {
        if (ck.length == 1) { // display popup for one point only
            var id = ck.val(),
            lonlat = ck.data('lonlat'),
            label = ck.data('label');

            if (!lonlat) {
                utilsLib.showError('No geolocation to display.');
                return false;
            }

            ck.attr('checked', false);

            if (id) {
                $("#dialog-bloc").trigger("showMap", [id, lonlat, label]);
            }
        } else { // go to map view for multiple points
            var idsList = [];
            ck.each(function() {
                idsList.push($(this).val());
            });
            // Refresh/Actualise app infos
            var infos = app.infos;
            infos.model.activeView = 'map-view';
            // infos.model.id = ''; // cannot determine it - docs are heterogeneous
            // consequence is that menu cannot be loaded
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
                name: 'Structure', 
                has_icon: true,
                icon_class: 'icon-dm-model',
                has_next: true
            },{
                name: 'Map view ', 
                has_icon: true,
                icon_class: 'icon-dm-map',
                has_next: false
            }]};
            $('#breadcrumb-container').trigger('_init', breadcrumbData);
            // load map view
            if ($('#db-details-container').length == 0) {
                $('#app-main-container').trigger('modelsManager');
            }
            if ($('#model-content').length == 0) {
                var modelInfo = {
                    mmId: infos.model.id
                };
                $('#db-details-container').trigger('dbModel', modelInfo);
            }
            $('#models-toolbar-container').trigger('_init');
            $('#model-content').trigger('map', {
                mmId: infos.model.id,
                idsList: idsList
            });
        }
    }
    return false;
}