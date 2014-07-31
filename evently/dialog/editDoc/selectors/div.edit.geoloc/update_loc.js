function(e, lat, lng) {
    // set hidden input field [lng, lat]
    if ((lat == null) || (lng == null)) { // change || to && to allow incomplete locations (ex: [1.2434, null])
        $('input.editw', this).val('');
    } else {
        $('input.editw', this).val('[' + lng + ',' + lat + ']');
    }
};