function() {
    var that = this,
        app = $$(this).app,
        idMap = $('.geoloc-edit-map', this).attr('id'),
        latInput = $('input.lat', this),
        lngInput = $('input.lng', this),
        lat = latInput.val(),
        lng = lngInput.val();

    app.data[idMap] = {map: null, marker: null};
    lat = parseFloat(lat) || '';
    lng = parseFloat(lng) || '';

    var pos = new google.maps.LatLng(lat, lng),
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
        draggable: true,
        map: app.data[idMap].map
    });
    
    // udate fields when marker moves
    google.maps.event.addListener(app.data[idMap].marker, 'dragend', function() {
        var position = app.data[idMap].marker.getPosition(),
            lat = position.lat().toFixed(5);
            lng = position.lng().toFixed(5);
        
        latInput.val(lat);
        lngInput.val(lng);
        
        $(that).trigger('update_loc', [lat, lng]);
    });

    var map = app.data[idMap].map;

    function resize() {
        google.maps.event.trigger(map, 'resize');
        map.setCenter(pos);
    }
    resize();

    setTimeout(resize, 300);
};