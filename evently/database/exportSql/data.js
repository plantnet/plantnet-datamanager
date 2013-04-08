function() {
    var app = $$(this).app,
        cacheLib = app.getlib('cache');

    var mms = cacheLib.get_cached_mms(app);

    mms.sort(function(a, b) {
        return (a.name.toLowerCase() < b.name.toLowerCase()) ? -1 : 1;
    });

    return {
        mms: mms
    };
}