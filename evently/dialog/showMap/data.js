function (id, lonlat, label) {

    var lon,
        lat;

    if (lonlat) {
        lonlat = lonlat.split(',');
        lon = parseFloat(lonlat[0]);
        lat = parseFloat(lonlat[1]);
    }

    //$.log('id', id, 'lonlat', lonlat, 'lon', lon, 'lat', lat);

    return {
        id: id,
        lon: lon,
        lat: lat,
        label: label
    };
}