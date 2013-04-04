function(e, params) {
    var app = $$(this).app,
        utilsLib = app.getlib('utils'),
        cookieLib = app.getlib('cookie'),
        mmId = utilsLib.decode_design_id(params.mmId),
        that = this,
        docLib = app.getlib('doc');

    function info(id, marker) {
        app.db.openDoc(id, {
            success: function(doc) {
                var content = docLib.to_html(doc, true, app),
                    infoWindow = new google.maps.InfoWindow({
                        content: content
                    });
                infoWindow.open(app.data.map, marker);
           }
       });
    }

    function display_points() {
        var bnds = app.data.map.getBounds(),
            bbox = [bnds.getSouthWest().lng(), bnds.getSouthWest().lat(),
                    bnds.getNorthEast().lng(), bnds.getNorthEast().lat()];

        utilsLib.showBusyMsg('Displaying points on map.', 'map');
        $.getJSON(app.db.uri + mmId + '/_spatial/points?plane_bounds=-180,-90,180,90&bbox=' + bbox, 
            function(data) {
                var ids = [];
                for (var i = 0, l = data.rows.length; i < l; i++) {
                    var d = data.rows[i],
                        co = d.geometry.coordinates,
                        pos = new google.maps.LatLng(co[1], co[0]),
                        marker = new google.maps.Marker({
                            icon: 'img/map/point.png',
                            position: pos, 
                            map: app.data.map
                        });
                    ids.push(d.id);
                    google.maps.event.addListener(marker, 'click', (function(id, m) {
                        return function() {
                            info(id, m);
                        };  
                    })(d.id, marker));
                }
                $("#geoloc-list", that).trigger("list_point", [ids]); 

                utilsLib.hideBusyMsg('map');
            });
    }

    function showMap() {
        var pos = new google.maps.LatLng(0, 0),
            mapTypeIds = [];
        
        for(var type in google.maps.MapTypeId) {
            mapTypeIds.push(google.maps.MapTypeId[type]);
        }
        
        // Add OSM layer to the map
        var osmMapType = new google.maps.ImageMapType({
            getTileUrl: function(coord, zoom) {
                return 'http://tile.openstreetmap.org/' + zoom + '/' + coord.x + '/' + coord.y + '.png';
            },
            tileSize: new google.maps.Size(256, 256),
            isPng: true,
            alt: 'OpenStreetMap',
            name: 'OSM',
            maxZoom: 19
        });
        mapTypeIds.push('OSM');
        
        var myOptions = {
                zoom: 2,
                center: pos,
                mapTypeId: google.maps.MapTypeId.TERRAIN,
                panControl: false,
                zoomControl: true,
                scaleControl: true,
                mapTypeControlOptions: {
                    mapTypeIds: mapTypeIds
                }
            };
        
        app.data.map = new google.maps.Map(document.getElementById('geoloc-view-map'), myOptions);
        app.data.map.mapTypes.set('OSM', osmMapType);
        google.maps.event.addListener(app.data.map, 'idle', display_points);/*'bounds_changed'*/
        
        // Add user layers to the map
        var userLayers = cookieLib.read('mapLayers');
        if (userLayers) {
            userLayers = JSON.parse(userLayers);
            
            app.overlayMaps = [];
            for (var i = 0; i < userLayers.length; i++) {
                var layer = userLayers[i];
                app.overlayMaps.push({
                   getTileUrl: function(coord, zoom){
                       var url = this.url;
                       url = url.replace('{zoom}', zoom).replace('{x}', coord.x).replace('{y}', coord.y);
                       return url;
                   },
                   url: layer.url,
                   opacity: layer.opacity,
                   minZoom: layer.minZoom,
                   maxZoom: layer.maxZoom,
                   isPng: true,
                   tileSize: new google.maps.Size(256, 256)
                });
            }
            
            for (i = 0; i < app.overlayMaps.length; i++){
                app.data.map.overlayMapTypes.push(null);
            }
            $.log(app.overlayMaps);
        }
    }
    
    // Step 1: Load up the google core API
    $.getScript('http://www.google.com/jsapi', function() {
        // Step 2: Once the core is loaded, use the google loader to bring in the maps module.
        google.load('maps', '3', { callback: showMap, other_params:'sensor=false&language=en'});
    });
}