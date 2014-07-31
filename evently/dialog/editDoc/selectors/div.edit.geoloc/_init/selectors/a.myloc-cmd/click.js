function() {
    var app = $$(this).app,
        utilsLib = app.getlib('utils'),
        idMap = $(this).parent().parent().find('.input-geoloc').data('geoloc-id'),
        mapData = app.data[idMap];
        that = $(this),
        latInput = $('#input-geoloc-' + idMap + ' input.lat'),
        lngInput = $('#input-geoloc-' + idMap + ' input.lng');

    navigator.geolocation.getCurrentPosition(
        function(position) {
            var lat = position.coords.latitude,
                lng = position.coords.longitude,
                location = new google.maps.LatLng(lat, lng);
            
            mapData.map.setCenter(location);
            mapData.marker.setPosition(location);
            
            latInput.val(lat);
            lngInput.val(lng);
            
            that.trigger('update_loc', [lat, lng]);
    }, function() {
        utilsLib.showWarning('Cannot get current location');
    });
    
    return false;
};