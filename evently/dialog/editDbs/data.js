function(dbs) {
    //$.log('received dbs', dbs);
    // Encode urls
    for (var i = 0; i < dbs.length; i++) {
        var url = dbs[i].url;
        dbs[i].encurl = $.couch.encodeDocId(url); // wtf
        if (url.slice(0,7) != 'http://') {
            dbs[i].url = '/' + url;
        }
    }
    
    return {
        dbs : dbs,
        app_path : $$(this).app.design.code_path
    };
};