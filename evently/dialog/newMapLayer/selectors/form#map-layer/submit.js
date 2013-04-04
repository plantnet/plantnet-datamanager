function(e) {
    var app = $$(this).app,
        utilsLib = app.getlib('utils'),
        cookieLib = app.getlib('cookie'),
        form = $(this),
        layerName = $('input[name="layer-name"]', form).val(),
        layerShortName = $('input[name="layer-short-name"]', form).val(),
        tilesUrl = $('input[name="tiles-url"]', form).val(),
        layerMaxZoom = parseInt($('input[name="layer-max-zoom"]', form).val()),
        layerMinZoom = parseInt($('input[name="layer-min-zoom"]', form).val()),
        layerOpacity = parseInt($('input[name="layer-opacity"]', form).val()),
        layer = {
            name: layerName,
            shortName: layerShortName,
            url: tilesUrl,
            maxZoom: layerMaxZoom,
            minZoom: layerMinZoom,
            opacity: layerOpacity};
    
    var mapLayers = cookieLib.read('mapLayers');
    mapLayers = (mapLayers) ? JSON.parse(mapLayers) : [];
    mapLayers.push(layer);
    cookieLib.create('mapLayers', JSON.stringify(mapLayers), 100);
    
    $('#map-layer-modal').modal('hide');
    $.pathbinder.begin();
    return false;
}