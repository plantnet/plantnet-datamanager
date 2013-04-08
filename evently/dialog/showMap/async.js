function(callback, e, id, lonlat, label) {

    var loadGoogleMapLibOk = (typeof google === 'object' && typeof google.maps === 'object') ? true : false;
    
    if(! loadGoogleMapLibOk) {
        //$.log('loading google map lib');
        loadGoogleMapLib();
    } else {
        next();
    }

    function loadGoogleMapLib() {

        $.getScript('http://www.google.com/jsapi', function() {
            // Step 2: Once the core is loaded, use the google loader to bring in the maps module.
            if(google.maps) {
                next();
            } else {
                google.load('maps', '3', {
                    callback: next, 
                    other_params: 'sensor=false&language=en'
                });
            }
        });
    }

    function next() {
        //$.log('next!');
        callback(id, lonlat, label);
    }
}