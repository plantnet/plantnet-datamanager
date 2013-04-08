// from http://www.shamasis.net/2009/09/fast-algorithm-to-find-unique-items-in-javascript-array/
exports.unique = function(that) {
    var o = {}, i, l = that.length, r = [], t;
    for(i = 0; i < l; i += 1) { 
        t = that[i];
        o[t] = t;
    }
    for(i in o) r.push(o[i]);
    return r;
};

exports.keys = function(that) {
    var res = [];
    for (var k in that) {
        res.push(k);
    }
    return res;
}

exports.is_array = function(a) {
    return Object.prototype.toString.call(a) === '[object Array]';
};


exports.objectEmpty = function(o) {
    for (var p in o) {
        if(o.hasOwnProperty(p)) {
            return false;
        }
    }
    return true;
}