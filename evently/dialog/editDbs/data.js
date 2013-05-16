function(dbs) {
    // Encode urls
    for (var i = 0; i < dbs.length; i++) {
        var url = dbs[i].url;
        if (url.slice(0,7) != 'http://') {
            dbs[i].url = '/' + url;
        }
    }

    return {
        dbs : dbs,
        hasLinks: (dbs.length > 0),
        app_path : $$(this).app.design.code_path
    };
};