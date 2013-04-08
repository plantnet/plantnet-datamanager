function (data) {
    var local = false,
        get = (data.action == 'pull'),
        put = (data.action == 'push'),
        source = data.source,
        target = data.target;

    if ((get && source.indexOf('http://') == -1) || (put && target.indexOf('http://') == -1)) {
        local = true;
    }

    // hide password
    if ((source.indexOf('http://') > -1) && get) {
        source = source.replace(/http:\/\/.+@/, 'http://');
    }
    if ((target.indexOf('http://') > -1) && put) {
        target = target.replace(/http:\/\/.+@/, 'http://');
    }

    return {
        filters: data.filters,
        source: source,
        target: target,
        get: get,
        put: put,
        local: local,
        remote: (! local)
    };
}