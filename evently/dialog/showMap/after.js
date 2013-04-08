function (e) {

    var app = $$(this).app,
        utilsLib = app.getlib('utils'),
        idMap = 'readonly-map',
        lat = $('input#lat', this).val(),
        lon = $('input#lon', this).val();

        lat = parseFloat(lat) || '';
        lon = parseFloat(lon) || '';

    $('#show-map-modal').modal('show');
    utilsLib.hideBusyMsg('showMap');

    $('#show-map-modal').on('shown', function() {
        app.data[idMap] = {map: null, marker: null};

        var pos = new google.maps.LatLng(lat, lon),
            myOptions = {
                zoom: 4,
                center: pos,
                mapTypeId: google.maps.MapTypeId.TERRAIN,
                panControl: false,
                zoomControl: true,
                scaleControl: true,
                mapTypeControlOptions: {
                    mapTypeIds: ['OSM', google.maps.MapTypeId.ROADMAP, google.maps.MapTypeId.HYBRID, 
                                 google.maps.MapTypeId.SATELLITE, google.maps.MapTypeId.TERRAIN]
                }
            };
        
        // Add OSM layer to the map
        osmMapType = new google.maps.ImageMapType({
            getTileUrl: function(coord, zoom) {
                return 'http://tile.openstreetmap.org/' +
                zoom + '/' + coord.x + '/' + coord.y + '.png';
            },
            tileSize: new google.maps.Size(256, 256),
            isPng: true,
            alt: 'OpenStreetMap',
            name: 'OSM',
            maxZoom: 19
        });
    
        app.data[idMap].map = new google.maps.Map(document.getElementById(idMap), myOptions);
        app.data[idMap].map.mapTypes.set('OSM', osmMapType);
    
        app.data[idMap].marker = new google.maps.Marker({
            position: pos, 
            draggable: false,
            map: app.data[idMap].map
        });
    
        app.data[idMap].map.setCenter(pos);
        google.maps.event.trigger(app.data[idMap].map, 'resize');
    });
}