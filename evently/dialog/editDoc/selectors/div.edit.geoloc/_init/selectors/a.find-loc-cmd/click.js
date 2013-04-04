function() {
    var app = $$(this).app,
        utilsLib = app.getlib('utils'),
        idMap = $(this).parents('.input-geoloc').data('geoloc-id'),
        idInputGeoloc = '#input-geoloc-' + idMap,
        location = $(idInputGeoloc + ' .location-str').val();
    
    if (location) {
        var that = $(this),
            geocoder = new google.maps.Geocoder(),
            mapData = app.data[idMap],
            map = mapData.map,
            marker = mapData.marker,
            latInput = $(idInputGeoloc + ' input.lat'),
            lngInput = $(idInputGeoloc + ' input.lng');
    
        geocoder.geocode({'address': location},
            function(results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    var location = results[0].geometry.location,
                        lat = location.lat().toFixed(5),
                        lng = location.lng().toFixed(5);
                    
                    map.setCenter(location);
                    marker.setPosition(location);
                    
                    latInput.val(lat);
                    lngInput.val(lng);
                    
                    that.trigger('update_loc', [lat, lng]);
                } else {
                    utilsLib.showWarning('Geocode was not successful for the following reason: ' + status);
                }
        });
    }
    
    return false;
};