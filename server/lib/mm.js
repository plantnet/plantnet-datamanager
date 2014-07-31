// return the fields with a type base on a referential for modt
// return a map field -> mm
// if mm_id_filter is not null, filter on it
exports.get_ref_fields_modt = function (mm, modt, mm_filters) {
    var ret = {},
        ok = false;
    // for each field in module
    for (var f = 0, l = mm.modules[modt].fields.length; f < l; f++) {
        var field = mm.modules[modt].fields[f];
        // if the type is based on a ref
        if (field.type === 'ref') {
            
            var mm_id = field.mm;
            if ((!mm_filters) || (mm_id in mm_filters)) {
                ret[field.name] = mm_id;
                ok = true;
            }
        }
    }    
    return ok ? ret : null;
};
    
// return the fields with a type base on a referential
// return a map indexed by "mm_id,modt" containing the fields with its mm
// ex {"mm_id,determination":{"taxon":"_design/mm_taxo_ref"}}
// if mm_filter is a map, return only field concerning mm_filters key
// ret is the return object. if null, create a new object

exports.get_ref_fields = function (mm, mm_filters, ret) {
    // get modules which use ref types
    ret = ret || {};
    for (var modt in mm.modules) {
        var v = this.get_ref_fields_modt(mm, modt, mm_filters);
        // keep only modt with ref fields
        if (v) { ret[[mm._id, modt]] = v; }
    }
    return ret;
};

// idem but for multiple mm

exports.get_ref_fields_mms = function (mms, mm_filters, ret) {
    // get modules which use ref types
    ret = ret || {};
    for (var i = 0; i < mms.length; i++) {
        exports.get_ref_fields(mms[i], mm_filters, ret);
    }
    return ret;
};
