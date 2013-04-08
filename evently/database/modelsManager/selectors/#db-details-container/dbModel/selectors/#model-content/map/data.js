function(e, params) {
    var app = $$(this).app,
        cookieLib = app.getlib('cookie'),
        mapLayers = cookieLib.read('mapLayers'),
        cacheLib = app.getlib('cache'),
        userLayers = [],
        hasLayer = false;

    if (mapLayers) {
        mapLayers = JSON.parse(mapLayers);
        
        if (mapLayers.length != 0) {
            hasLayer = true;
            
            for (var i = 0; i < mapLayers.length; i++) {
                var layer = mapLayers[i];
                layer.id = i;
                userLayers[i] = layer;
            }
        }
    }

    return {
        has_layer: hasLayer,
        user_layers: userLayers,
        modelName: cacheLib.get_cached_mm(app, '_design/' + app.infos.model.id).name
    }
}