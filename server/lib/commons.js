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
 
exports.uniqueInObject = function(that, field, stages) {
    var o = {}, i, l = that.length, r = [], t;
    for(i = 0; i < l; i += 1) {
        t = that[i];
        if (stages) {
            for (var j=0; j < stages.length; j++) {
                t = t[stages[j]];
            }
        }
        t = t[field];
        o[t] = that[i];
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
};

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
};

// merges two objects based on their top-level keys
// if a key exists in both objects, o2 gets the priority
exports.mergeObjects = function(o1, o2) {
    o1 = o1 || {};
    o2 = o2 || {};
    var o = {};
    for (var k in o1) {
        if (o1.hasOwnProperty(k)) {
            o[k] = o1[k];
        }
    }
    for (var k in o2) {
        if (o2.hasOwnProperty(k)) {
            o[k] = o2[k];
        }
    }
    return o;
};

// call it like that:
// asyncForEach(myArray, function(item, next) {
//     // do whatever you want with "item"
//     // next();
// }, myCallback);
exports.asyncForEach = function(array, apply, callback) {
    if (array.length == 0) {
        callback();
        return;
    }
    var tasks = array.length;
    for (var i=0; i < array.length; i++) {
        apply(array[i], next);
    }
    function next() {
        tasks--;
        if (tasks == 0) {
            callback();
        }
    }
};