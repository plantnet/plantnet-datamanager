var utils = require('vendor/datamanager/lib/utils'),
    cache = require('vendor/datamanager/lib/cache');


// return mm raw structures
exports.get_mms = function(db, callback) {
    db.allDocs({
	    startkey: '_design/mm_',
	    endkey: '_design/mm_\ufff0',
	    include_docs: true,
        cache: JSON.stringify(new Date().getTime()),
        success: function(data) {
            callback(data.rows.map(function(e) {
                return e.doc; 
            }));
        }
	});
};


// return mm raw structures
exports.get_mms_by_id = function(db, ids, callback) {
    db.allDocs( {
	    keys: ids,
	    include_docs: true,
        cache: JSON.stringify(new Date().getTime()),
	    success: function (data) {
            var mms = {};
            for (var i = 0; i < data.rows.length; i++) {
                mms[data.rows[i].id] = data.rows[i].doc;
            }
            callback(mms);
	    }
	});
};

// return a list of modi ordered by structure
exports.get_sorted_modis = function(mm) {
    var modules = [],
        modi,
        hasson = {},
        mayCreate = {};
        
    if (!mm) { return modules; }

    for (modi in mm.structure) {
        mayCreate[modi] = true;
        var parent = mm.structure[modi][1];
        if (parent) {
            hasson[parent] = true;
        }
        while (parent && mayCreate[modi]) { // if all parents are optional, then we may create directly a doc in this modi
            mayCreate[modi] = (mayCreate[modi] && mm.structure[parent][2]);
            parent = mm.structure[parent][1];
        }
    }

    for (modi in mm.structure) {
        var modt = mm.structure[modi][0];
        if (! mm.modules[modt]) { // if modt referenced in structure doesn't exist in modules (error when saving mm?)
            $.log('libmm: Skipping inexistant module "' + modt + '"');
            continue;
        }
        var splitted = modi.split('.'),
            opt = mm.structure[modi][2],
            title = mm.structure[modi][3],
            index_tpl = mm.structure[modi][4],
            mod = mm.modules[modt],
            level = splitted.length - 2,
            fname = splitted.map(function(e) { 
                return mm.modules[e] ? mm.modules[e].name : '';
            }).join('.');
        
        var obj = {
            name: mod.name,
            fname: fname,
            title: title,
            label: title || fname,
            modt: modt,
            modi: modi,
            opt: opt,
            index_tpl: index_tpl,
            level: level,
            withattchs: mm.modules[modt].withimg || mm.modules[modt].withattchs,
            noson: !hasson[modi],
            may_create: mayCreate[modi]
        };
        modules.push(obj);
    }

    modules.sortBy("modi");
    //modules.sortBy("fname");

    return modules;
};

exports.delete_mm_docs = function(db, mm_id, onSuccess, onError, includeViewsAndQueries) {

    var docs;

    if (includeViewsAndQueries === undefined) {
        includeViewsAndQueries = true;
    }
    onError = onError || function() {};

    db.view('datamanager/by_mm', {
        key : mm_id,
        cache : JSON.stringify(new Date().getTime()),
        reduce : false,
        success : function(rdocs) {
            docs = rdocs.rows.map(function(row) {
                return {
                    _id: row.id,
                    _rev: row.value._rev
                };
            });
            db.bulkRemove({docs : docs, 'all_or_nothing' : true } , {
                success: function(data) {
                    if (includeViewsAndQueries) {
                        exports.delete_mm_vq(db, mm_id,
                            function() {
                                onSuccess();
                            },
                            function(err) {
                                onError(err);
                            }
                        );
                    } else {
                        onSuccess(data);
                    }
                },
                error: function(e_id, str, details) {
                    onError(details);
                }
            });
        }
    });
};


exports.delete_modi_docs = function(db, mm_id, modi, onSuccess, onError) {
    var docs, ids;
    db.view('datamanager/by_mod', {
        key: ['_design/' + mm_id, modi],
        cache: JSON.stringify(new Date().getTime()),
        reduce: false,
        success: function(vdocs) {
            docs = vdocs.rows.map(function(row) {
                return {
                    _deleted: row.value._deleted, // wtf? never emitted!
                    _id: row.id,
                    _rev: row.value._rev
                };
            });
            ids = vdocs.rows.map(function(row) {
                return row.id;
            });
            if (docs.length === 0) {
                onSuccess(0);
            }

            db.bulkRemove({
                docs: docs, 
                'all_or_nothing': true 
            }, {
                success: onSuccess,
                error: function(e_id, str, details) {
                    onError('Error : ' + details);
                }});
        }
    });
};

// return a obj containing for each modi the list of sons modi
exports.get_modis_by_parent = function(mm) {
    var ret = {};
    for (var modi in mm.structure) {
        var modt = mm.structure[modi][0];

        var cmodi = modi;
        do {
            var parent = mm.structure[cmodi][1];
            
            ret[parent] = ret[parent] || [];
            ret[parent].push({modi : modi, label : mm.structure[modi][3] || mm.modules[modt].name});
            cmodi = parent;
        } while (cmodi && mm.structure[cmodi][2]); // while parent is optional
    }

    return ret;
};

// return a list of related dictionnary id
exports.get_dict_id = function(mm) {
    var ret = [];
    
    for (var modt in mm.modules) {
        var fields = mm.modules[modt].fields;
        for (var f = 0; f < fields.length; f++) {
            if (fields[f].type === 'ref') {
                ret.push(fields[f].mm);
            }
        }
    }
    
    return ret.unique();
};

//MOVED to node server - but still used here
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
//return the fields with a type base on a referential for modt
//return a map field -> mm
//if mm_id_filter is not null, filter on it
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

exports.getParentModule = function (mm, modi) {

    var parentMod = false;
    if (modi.lastIndexOf('.') > 0) {
        var parentModIndex = modi[modi.lastIndexOf('.')-1];
        parentMod = mm.modules[parentModIndex];
    }

    return parentMod;
}

exports.get_modi_list_with_fields = function(mm, mms_by_id) {
    var cache = {},
        modis = exports.get_sorted_modis(mm);
    
    // add field info for each module
    for (var i = 0; i < modis.length; i++) {
        var mod = mm.modules[modis[i].modt],
            fields = [],
            nbField = mod.fields.length;
        
        for (var f = 0; f < nbField; f++) {
            var fieldName = mod.fields[f].name,
                fieldLabel = mod.fields[f].label || fieldName,
                fieldType = mod.fields[f].type,
                refs = null,
                mm_ref_id = null;// add ref structure

            if (fieldType === 'ref') {
                mm_ref_id = mod.fields[f].mm;

                // get cached result
                if (!cache[mm_ref_id] && mms_by_id) {
                    var ref_mm = mms_by_id[mm_ref_id];
                    refs = exports.get_sorted_modis(ref_mm);
                    cache[mm_ref_id] = refs;
                } else {
                    refs = cache[mm_ref_id];
                }
                
                refs = $.extend(true, [], refs); // deep copy
                // modify info because they are treated as referential field
                refs.map(function(module) {
                    module.ref_path = ['$ref', fieldName, module.modi, fieldLabel];
                    module.pmodi = modis[i].modi;
                    module.fname = modis[i].fname + '.' + fieldName + '.' + module.name;
                    module.ref_label = modis[i].label + '.' + fieldLabel + module.label;
                    module.mm_ref_id = mm_ref_id;
                });
            }
            
            fields.push({
                modi: modis[i].modi,
                name: fieldName,
                field_label: fieldLabel,
                fname: modis[i].fname + '.' + fieldName,
                modi_label: modis[i].label + '.' + fieldLabel,
                refs: refs,
                mm_ref_id: mm_ref_id,
                type: fieldType
            });
        }

        modis[i].fields = fields;
    }
    return modis;
};


// validate mm data
exports.validate_mm = function (mm, app, msg) {
    _check_field_names(mm);
    _check_module_names(mm);
    _check_lt(mm, msg);
    _validate_templates(mm, app);
    _generate_spatial_func(mm);
    _generate_label_func(mm, app.ddoc);
};

// checks that a label template is defined for each modt. If not, defines a default one
// using the first field of the module, and propagates an information message
var _check_lt = function (mm, msg) {
    var modt;
    for (modt in mm.modules) {
        var labeltpl = mm.modules[modt].label_tpl;
        if (('' + labeltpl).trim() == '') {
            var new_lt = '${' + mm.modules[modt].fields[0].name + '}';
            mm.modules[modt].label_tpl = new_lt;
            msg.push({
                modt: modt,
                lt: new_lt
            });
        }
    }
}

// throw an exception if a field name is repeated in a module
// should already be controlled when adding a field
var _check_field_names = function (mm) {
     var modt, 
         modi;

     for (modt in mm.modules) {
         var fns = {},
             mn = mm.modules[modt].name;

         for (var i = 0; i < mm.modules[modt].fields.length; i++) {
             var fn = mm.modules[modt].fields[i].name;
             if (fns[fn]) {
                 throw new Error('Module ' + mn + ' : Field ' + fn + ' is duplicated');
             }
             fns[fn] = true;
         }
     }

     // obsolete: label templates are now mandatory
     /*for (modi in mm.structure) {
         modt = mm.structure[modi][0];
         var labeltpl = mm.structure[modi][4] || mm.modules[modt].label_tpl;
    
         if (mm.isref && (!labeltpl || !labeltpl.length)) {
             var mn = mm.structure[modi][3] || 
                 modi.split('.').map(function (e) {
                     if (e) {
                         return mm.modules[e].name;
                     }}).join('.'); 
    
             throw new Error('Module ' + mn + ' : Label Template cannot be empty');
         }
     }*/
};

// throw an exception if a module name is repeated in the model
// or if a module title is repeated in the structure
var _check_module_names = function (mm) {

    var modt,
        modi,
        names = {},
        titles = {},
        msg;

    for (modt in mm.modules) {
        var name = mm.modules[modt].name;
        if (name in names) {
            throw new Error('Module name "' + name + '" cannot be used more than once');
        } else if ((msg = utils.validateName(name)) != null) {
            throw new Error('Module name "' + name + '" ' + msg); 
        } else {
            names[name] = true;
        }
    }

    for (modi in mm.structure) {
        var title = mm.structure[modi][3];
        if (title) {
            if (title in titles) {
                throw new Error('Module title "' + title + '" cannot be used more than once');
            } else if ((msg = utils.validateName(title)) != null) {
                throw new Error('Module title "' + title + '" ' + msg); 
            } else {
                titles[title] = true;
            }
        }
    }
};

// generate spatial function in mm
var _generate_spatial_func = function(mm) {
    var modts = {};

    // get module with geoloc
    for (var modt in mm.modules) {
        var mod = mm.modules[modt];
        for (var i = 0; i < mod.fields.length; i++) {
            if (mod.fields[i].type == 'geoloc') {
                modts[modt] = modts[modt] || [];
                modts[modt].push(mod.fields[i].name);
            }
        }
    }

    mm.spatial = mm.spatial || {};
    mm.spatial.points = _get_spatial_func(mm._id, modts);
};

// @TODO should filter on field type and not (.length == 2), could be a multi-enum of size 2!
var _get_spatial_func = function(mm_id, modts) {
    var ret = 'function (doc) {' +
        'if(doc.$mm != "' + mm_id + '") { return; }' +
        'var modts = ' + JSON.stringify(modts)+ ';' +
        'if(doc.$modi && doc.$modt in modts) {' +
        '    var fields = modts[doc.$modt];' +
        '    for(var i = 0; i < fields.length; i++) {' +
        '        var field = fields[i]; ' +
        '        var loc = doc[field];' +
        '        if(!loc || loc.length != 2) { continue; }' +
        '        emit({type : "Point", coordinates:[loc[0], loc[1]]},' +
        '         {_id:doc._id, loc:loc}); ' +
        '    }' +    
        '}'+
        '   for (var f in doc.$ref) {' +
        '      var loc = doc.$ref[f].geoloc;' +
        '      if (loc && loc.length == 2) {' +
        '          emit({type : "Point", coordinates:[loc[0], loc[1]]}, {_id:doc._id, loc:loc}); ' +
        '      }' +
        '    }' +
        '}';  
    return ret;
};


// validate a index template
var _validate_index_template = function (mod, it, mm) {

    if (!it) { return true; }

    // find each variable
    var re = /(\$\{([^\}]*)\})+/g,
        resul,
        itf,
        ok = true; 

    while (resul = re.exec(it)) {
        itf = resul[2];
        
        if (itf != '') {
            var inFields = false, isParent = true, itfs = itf.split(".");
            
            for (var p = 0, l = itfs.length; p < l;  p++) {
                isParent = isParent && itfs[p] === "parent";
            }
            
            for (var f = 0, l = mm.modules[mod].fields.length; f < l; f++) {
                if (mm.modules[mod].fields[f].name === itf) {
                    inFields = true;
                    break;
                }
            }
            ok = ok && (inFields || isParent);
        } else {
            ok = false;
        }
    }

    return ok;
};



// validate a label template
var _validate_label_template = function (mod, lt, mm) {

    // find each variable
    var re = /(\$\{([^\}]*)\})+/g,
        resul,
        ltf,
        ok = true;

    while (resul = re.exec(lt)) {
        ltf = resul[2];
        if (ltf != '') {
            var vltf = validate_label_template_field(mod, ltf, mm);
            ok = (ok && vltf);
        } else {
            ok = false;
        }
    }

    return ok;
};

// mod : modi or modt
// ltf : label template field
var validate_label_template_field = function(mod, ltf, mm) {

    if (ltf == '') {
        return false;
    }

    var ok = true,
        inParent = (ltf.indexOf('parent.') != -1),
        inModi = (mod[0] == '.');

    if (inParent) {
        var parentLtf = ltf.substring(7);
        if (inModi) {
            var parentModi = mod.substr(0, mod.lastIndexOf('.'));
            if (parentModi == '') {
                ok = false;
            } else {
                var vltf = validate_label_template_field(parentModi, parentLtf, mm);
                ok = (ok && vltf);
            }
        } else {
            if (parentLtf == '') {
                ok = false;
            } else {
                // no way to know at this time
            }
        }
    } else {
        var modNum = mod;
        if (inModi) {
            modNum = mod[mod.length-1];
        }
        var inFields = false;
        if (ltf == '_attachments') {
            ok = (ok && mm.modules[modNum].withattchs);
        } else {
            for (var f = 0, l = mm.modules[modNum].fields.length; f < l; f++) {
                if (mm.modules[modNum].fields[f].name === ltf) {
                    inFields = true;
                    break;
                }
            }
            ok = (ok && inFields);
        }
    }

    return ok;
};

var _validate_templates = function (mm, app) {
    var templates_by_mod = {};
    for (var modt in mm.modules) {
        var tpl = mm.modules[modt].label_tpl;
        if (tpl) { templates_by_mod[modt] = tpl; }
    }

    for (var modi in mm.structure) {
        var tpl = mm.structure[modi][4];
        if (tpl) { templates_by_mod[modi] = tpl; }
    }

    // label templates
    for (var mod in templates_by_mod) {
        if (! (_validate_label_template(mod, templates_by_mod[mod], mm))) {
            var modName;
            if (mod[0] == '.') {
                var modLabel = cache.get_name(app, mm._id, mod);
                modName = mm.modules[mod[mod.length-1]].name + ' at "' + modLabel + '"';
            } else {
                modName = mm.modules[mod].name;
            }
            throw new Error('Invalid label template for ' + modName);
        }
    }

        // label templates
    for (var mod in mm.modules) {
        if (! (_validate_index_template(mod, mm.modules[mod].index_tpl, mm))) {
            var modName;
            modName = mm.modules[mod].name;
            throw new Error('Invalid index template for ' + modName);
        }
    }
}

// returns the modis (of modt refModt) that a given doc may be set in, grouped
// by parent modi - the "active" parameter is set to true if the found modi equals refModi
exports.getPossibleModis = function(mm, refModt, refModi) {

    var possibleModis = {};
    addGoodModis('', '_root', true); // start at root modules

    function addGoodModis(parent, firstParent, processChildren) {
        if (! (firstParent in possibleModis)) {
            possibleModis[firstParent] = [];
        }
        for (var modi in mm.structure) {
            //$.log('trying', mm.structure[modi][1], '==', parent);
            if (mm.structure[modi][1] == parent) {
                //$.log('trouvé un modi avec parent', parent, modi);
                if (mm.structure[modi][0] == refModt) { // good modt
                    possibleModis[firstParent].push({
                        id: modi,
                        name: mm.modules[mm.structure[modi][0]].name + ' - ' + mm.structure[modi][3],
                        active: (modi == refModi)
                    });
                }
                if (mm.structure[modi][2]) { // is optional
                    addGoodModis(modi, firstParent, false); // thou shalt not process children twice!
                }
                if (processChildren) {
                    addGoodModis(modi, modi, true);
                }
            }
        }
    }

    return possibleModis;
}

// returns the modts that a modi may accept as (direct or indirect) children,
// grouped by modi
var _getChildrenModtByModi = function(mm) {

     var cmbm = {};
     addGoodModts('', '', true); // start at root modules

    function addGoodModts(parent, parentModi, processChildren) {
        if (parentModi && (! (parentModi in cmbm))) {
            cmbm[parentModi] = [];
        }
        for (var modi in mm.structure) {
            if (mm.structure[modi][1] == parent) {
                if (parentModi) {
                    if (cmbm[parentModi].indexOf(mm.structure[modi][0]) == -1) {
                        cmbm[parentModi].push(mm.structure[modi][0]); // push modt as a possible child of parentModi
                    }
                }
                if (mm.structure[modi][2]) { // is optional
                    addGoodModts(modi, parentModi, false); // thou shalt not process children twice!
                }
                if (processChildren) {
                    addGoodModts(modi, modi, true);
                }
            }
        }
    }

    return cmbm;
}

// generate ref value function in mm
var _generate_label_func = function(mm, ddoc) {

    /*var templates_by_mod = {};
    for (var modt in mm.modules) {
        var tpl = mm.modules[modt].label_tpl;
        if (tpl) { templates_by_mod[modt] = tpl; }
    }

    for (var modi in mm.structure) {
        var tpl = mm.structure[modi][4];
        if (tpl) { templates_by_mod[modi] = tpl; }
    }*/

    // smart parent autocompletion
    var children_modt_by_modi = _getChildrenModtByModi(mm);

    var lib_path = ddoc.views.lib.path;
    mm.views = mm.views || {};
    mm.views.label = {};
    mm.views.label.map = _get_label_func(mm._id, lib_path, children_modt_by_modi);
    mm.views.label.reduce = '_count';
};

// only useful for smart parent autocompletion (move doc to other modi);
// otherwise use general "label" view
var _get_label_func = function(mm_id, lib_path, children_modt_by_modi) {
    var ret = 'function (doc) {' + "\n" +
        'if(!doc.$modi) { return; }' + "\n" +
        'if(doc.$mm != "' + mm_id + '") { return; }' + "\n" +
        'log("couscous")' + "\n" +
        'log(doc._id)' + "\n" +
        'var chmodt_by_modi = ' + JSON.stringify(children_modt_by_modi)+ ';' + "\n" +
        'var exports = {};' + "\n" +
        '    ' + lib_path + "\n" +
        '    exports.emit_label(doc, chmodt_by_modi);' + "\n" +
        '}';  
    return ret;
};

// return onSuccess(data) where data.id is new_mm_id
exports.copy_mm = function(db, mm_id, new_name, onSuccess, onError) {
    var new_id = '_design/mm_' + $.couch.newUUID();

    db.openDoc(mm_id, {
        success : function (doc) {
            
            delete doc._rev;
            doc._id = new_id;
            doc.name = new_name ? new_name : doc.name + ' - copy';
            db.saveDoc(doc, {
                success : onSuccess,
                error : onError
            });
        },
        error : onError
    });
};


exports.merge_mms = function (mms) {
    var merged = mms[0];
    return mms;
};


// return a view
// if compress return a minimized object
// if expand_geoloc, splits each "geoloc" field into 2 fields: fieldname_lat and fieldname_lon
// if export_synonymy, adds 2 columns for each modi: $valid_name_id and $synonym_of
exports.mm_to_view = function (mm, compress, expand_geoloc, export_synonymy) {
    var ret = [],
    modis = exports.get_sorted_modis(mm);

    for (var i = 0; i < modis.length; i++) {
        var label = modis[i].label,
        module = mm.modules[modis[i].modt],
        modi = modis[i].modi,
        fields = module.fields;

        for (var f = 0; f < fields.length; f++) {
            var n = fields[f].name,
                type = fields[f].type,
                obj;

            //log("\ntrouvé champ: pour f=[" + f + "] => " + JSON.stringify(fields[f]));
            if (type == "geoloc" && expand_geoloc) {
                var obj1, obj2;
                if (compress) {
                    obj1 = {
                        m: modi,
                        f: n + '_lon'
                    };
                    obj2 = {
                        m : modi,
                        f: n + '_lat'
                    };
                } else {
                    obj1 = {
                        $modi : modi,
                        field : n + '_lon',
                        label : label + "." + n + '_lon',
                        type: type
                    };
                    obj2 = {
                        $modi : modi,
                        field : n + '_lat',
                        label : label + "." + n + '_lat',
                        type: type
                    };
                }
                ret.push(obj1);
                ret.push(obj2);
            } else {
                if (compress) {
                    obj = {
                        m : modi,
                        f : n
                    };
                } else {
                    obj = {
                        $modi : modi,
                        field : n,
                        label : label + "." + n,
                        type: type
                    };
                }
                ret.push(obj);
            }
        }

        // add attach
        if(module.withimg || module.withattchs) {
            var obj1, obj2;
            if (compress) {
                obj1 = {
                    m : modi,
                    f : "_attchs_files"
                };
                obj2 = {
                    m : modi,
                    f : "_attchs_urls"
                };
            } else {
                obj1 = {
                    $modi : modi,
                    field : "_attchs_files",
                    label : label + "._attchs_files"
                };
                obj2 = {
                    $modi : modi,
                    field : "_attchs_urls",
                    label : label + "._attchs_urls"
                };
            }
            ret.push(obj1);
            ret.push(obj2);
        }

        // add synonymy
        if (export_synonymy) {
            ret.push({
                $modi: modi,
                field: '_id',
                label: label + '.$valid_name_id'
            });
            ret.push({
                $modi: modi,
                field: '$synonym',
                label: label + '.$synonym_of'
            });
        }
    }

    return ret;
};

/**
 * Returns the number of docs in the given mm using "by_mm" stale view
 */
exports.get_docs_count = function (app, mmId, callback) {

    if (mmId.substr(0,8) !== '_design/') {
        mmId = '_design/' + mmId;
    }

    app.db.view('datamanager/by_mm', {
        cache: JSON.stringify(new Date().getTime()),
        startkey: mmId,
        endkey: mmId + '\ufff0',
        include_docs: false,
        reduce: true,
        stale: 'ok',
        success: function(data) {
            if (data.rows[0] && data.rows[0].value) {
                callback(data.rows[0].value);
            } else {
                callback(0);
            }
        }
    });
}
