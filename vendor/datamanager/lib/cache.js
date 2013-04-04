// init name cache for a single mm
var _init_mm = function(app, mm, mmLib) {
    app.cache = app.cache || {};
    app.cache.mms = app.cache.mms || {};
    app.cache.modt_name = app.cache.modt_name || {};
    app.cache.label_tpl = app.cache.label_tpl || {};
    app.cache.field_type = app.cache.field_type || {};
    app.cache.field_label = app.cache.field_label || {};

    // cache the whole mm
    app.cache.mms[mm._id] = mm;

    for (var modt in mm.modules) {
        app.cache.modt_name[mm._id + modt] = mm.modules[modt].name;
        app.cache.label_tpl[mm._id + modt] = mm.modules[modt].index_tpl;

        var fields = mm.modules[modt].fields;
        for (var i = 0; i < fields.length; i++) {
            app.cache.field_type[mm._id + modt + fields[i].name] = fields[i].type;
            app.cache.field_label[mm._id + '-' + modt + '-' + fields[i].name] = fields[i].label;
        }
    }

    for (var modi in mm.structure) {
        var title = mm.structure[modi][3],
        tpl = mm.structure[modi][4];
        
        if (title) {
            app.cache.modt_name[mm._id + modi] = title;
        }
        if (tpl) {
            app.cache.label_tpl[mm._id + modi] = tpl;
        }
    }

    // store add prone modules
    var orderedModis = mmLib.get_sorted_modis(mm);
    app.cache.mms[mm._id].addProneModules = [];
    orderedModis.map(function(e) {
        if (e.may_create) {
            app.cache.mms[mm._id].addProneModules.push({
                modi: e.modi,
                longLabel: exports.get_name(app, mm._id, e.modi),
                shortLabel: e.title ? e.title : e.name
            });
        }
    });
};

/**
 * Gets all mms and put them in the cache, then calls back with the mms
 */
exports.init_all_mms = function(app, callback) {

    //$.log('regenerating cache');
    var mmLib = app.getlib('mm');
    mmLib.get_mms(app.db, function(mms) {
        if (app.cache && app.cache.mms) {
            app.cache.mms = {}; // reinit mm cache
        }
        mms.map(
            function(modelOfModule) {
                _init_mm(app, modelOfModule, mmLib);
            }
        );
        callback(exports.get_cached_mms(app));
    });
};

/**
 * Returns all the mms present in the cache as an Array
 */
exports.get_cached_mms = function(app) {

    if (app.cache && app.cache.mms) {
        var mmsList = [];
        for (k in app.cache.mms) {
            mmsList.push(app.cache.mms[k]);
        }
        return mmsList;
    } else {
        return null;
    }
};

/**
 * Returns the requested mm from the cache if present
 */
exports.get_cached_mm = function(app, mm_id) {

    if (app.cache && app.cache.mms && (mm_id in app.cache.mms)) {
        return app.cache.mms[mm_id];
    } else {
        return null;
    }
};

// return the modi label using the cache
exports.get_cached_label_tpl = function(app, mm_id, modi, modt) {
    try {
        var tpl = app.cache.label_tpl[mm_id + modi] || app.cache.label_tpl[mm_id + modt];
        return tpl;
    } catch (x) {
        return '';
    }
};

// return the modi label using the cache
exports.get_name = function(app, mm_id, modi) {

    if (modi && modi[0] === '*') {
        modi = modi.slice(1); // remove leading *
    }

    var cache;
    try {
        cache = app.cache.modt_name;
    } catch (x) {
        return modi;
    }

    if (cache[mm_id + modi]) {
        return cache[mm_id + modi];
    }

    var fullname = modi.split('.').map(
        function(e) {
            return cache[mm_id + e];
        });
    return fullname.join('.');
};

exports.get_field_type = function(app, mm_id, modt, field_name) {
    try {
        var cache = app.cache.field_type;
        return cache[mm_id + modt + field_name];  
    } catch (x) {
        return '';
    }
};

exports.getFieldLabel = function(app, mmId, modT, fieldName) {
    try {
        var cache = app.cache.field_label;
        return cache[mmId + '-' + modT + '-' + fieldName];  
    } catch (x) {
        return '';
    }
};