function(e, params) {
    var app = $$(this).app,
        cookieLib = app.getlib('cookie'),
        mapLayers = cookieLib.read('mapLayers'),
        cacheLib = app.getlib('cache'),
        userLayers = [],
        idsList = params.idsList,
        hasLayer = false;

    var structure = null,
        structureLayers = [];

    if (! idsList) { // get all points from current structure
        structure = cacheLib.get_cached_mm(app, '_design/' + app.infos.model.id);

        // List all available "layers" in the structure: one by (modi / fieldname) combination
        var modt,
            f,
            name;
        for (var modi in structure.structure) {
            modt = structure.structure[modi][0];
            for (var i=0; i < structure.modules[modt].fields.length; i++) {
                f = structure.modules[modt].fields[i];
                if (f.type == 'geoloc') {
                    name = '' + (structure.structure[modi].label || structure.modules[modt].name) + ' - ';
                    if (f.label) {
                        name += f.label;
                    } else {
                        name += f.name;
                    }
                    structureLayers.push({
                        name: name,
                        modi: modi,
                        fieldname: f.name
                    });
                } else if (f.type == 'ref') {
                    var refStruct = cacheLib.get_cached_mm(app, f.mm),
                        hasGeoloc = false;
                    if (refStruct) {
                        for (var refModt in refStruct.modules) {
                            for (var j=0; j < refStruct.modules[refModt].fields.length; j++) {
                                hasGeoloc = (hasGeoloc || (refStruct.modules[refModt].fields[j].type == 'geoloc'));
                            }
                        }
                    }
                    if (hasGeoloc) {
                        name = '' + (structure.structure[modi].label || structure.modules[modt].name) + ' - ';
                        if (f.label) {
                            name += f.label;
                        } else {
                            name += f.name;
                        }
                        name += ' (ref)'; // mention reference target?
                        structureLayers.push({
                            name: name,
                            modi: modi,
                            fieldname: f.name
                        });
                    }
                }
            }
        }
    
        // all layers are activated by default
        app.layersFilter = app.layersFilter || {};
        for (var i=0; i < structureLayers.length; i++) {
            var sl = structureLayers[i];
            app.layersFilter[sl.modi + '-' + sl.fieldname] = {
                modi: sl.modi,
                field: sl.fieldname
            };
        }
    }

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
        mm_id: app.infos.model.id,
        has_layer: hasLayer,
        user_layers: userLayers,
        structure_layers: structureLayers,
        modelName: structure ? structure.name : 'custom documents list'
    }
}