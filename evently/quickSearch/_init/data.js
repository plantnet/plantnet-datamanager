function(mms) {
    var app = $$(this).app,
        cacheLib = app.getlib('cache');

    return {
        mms: cacheLib.get_cached_mms(app)
    };
}