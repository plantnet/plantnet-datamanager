function() {
    var app = $$(this).app,
        cookieLib = app.getlib('cookie'),
        utilsLib = app.getlib('utils'),
        layerName = $.trim($(this).text()),
        layerId = $(this).attr('data-layer-id'),
        answer = confirm('Delete layer "'+layerName+'" ?');
    
    if (answer) {
        var mapLayers = cookieLib.read('mapLayers'),
            needToEraseCookie = false;
        
        mapLayers = (mapLayers) ? JSON.parse(mapLayers) : [];
        mapLayers = mapLayers.slice(layerId, layerId);
        cookieLib.create('mapLayers', JSON.stringify(mapLayers), 100);
        
        // Delete "select" dropdown element
        $('input[data-layer-id="' + layerId + '"].layer')
            .removeAttr('checked').trigger('click')
            .parents('li').remove();
        if ($('#geoloc-layers li').length == 0) {
            $('#map-layers-select').remove();
            needToEraseCookie = true;
        }
        // Delete current "delete" dropdown element
        $(this).parents('li').remove();
        if ($('#geoloc-layers-delete li').length == 0) {
            $('#map-layers-delete').remove();
        }
        
        // Erase cookie if no layers
        if (needToEraseCookie) {
            cookieLib.erase('mapLayers');
        }
        utilsLib.showSuccess('The layer "' + layerName + '" has been deleted.')
    }
}