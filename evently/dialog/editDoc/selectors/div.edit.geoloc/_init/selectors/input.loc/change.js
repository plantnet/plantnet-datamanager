function() {
    var app = $$(this).app,
        inputGeoloc = $(this).parent().parent().find('.input-geoloc'),
        idMap = inputGeoloc.data('geoloc-id'),
        mapData = app.data[idMap],
        lat = $(this).parent().find('input.lat').val(),
        lng = $(this).parent().find('input.lng').val();

    lat = parseFloat(lat);
    if (isNaN(lat)) {
        lat = null;
    }
    lng = parseFloat(lng);
    if (isNaN(lng)) {
        lng = null;
    }

    var pos = new google.maps.LatLng(lat, lng);

    mapData.marker.setPosition(pos);
    mapData.map.setCenter(pos);

    $(this).trigger('update_loc', [lat, lng]);
};