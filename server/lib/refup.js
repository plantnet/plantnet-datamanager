var MM = require("mm"),
Commons = require("commons"),
Label = require("label");


// process each modt separatly
function _update_mm_modt (db, mm_modt, cb) {
    // get docs
    var docs = [];
    // apply ref data to documents of modt
    // get docs
    db.view("datamanager", "by_mod", {
        key : mm_modt,
        include_docs : true,
        reduce : false 
        }, function (err, by_modt) {
            // get docs
            docs = by_modt.rows.map( function (e) { return e.doc; }  );
            if(!docs.length) { return; }

            // apply ref_data
            exports.update_docs(db, docs, 
                function (docs, changed_docs) {
                    // save changes
                    db.bulkDocs({docs : changed_docs, "all_or_nothing": true},
                        function () {
                            log("ref of " + mm_modt + " updated");
                            cb(changed_docs.length);
                        });
                });
        });
}

// Update ref data in mm
// mm_filter is an object containing the id of the referential data to update
exports.update_mm = function(db, mm, cb, mm_filter) {
    log("updating ref for mm " + mm.name);
    doccpt = 0, callcpt = 1;

    function next(cpt) {
        callcpt --;
        doccpt += cpt;
        if(!callcpt) { cb(doccpt); }
    }


    // get the field to update
    var fields_to_up = MM.get_ref_fields(mm, mm_filter);
    // get the list of modt to process
    for (var mm_modt in fields_to_up) {
        callcpt++;
        _update_mm_modt(db, mm_modt.split(","), next);
    }                        
    next(0);
};



// set ref data in docs using $ref[field]._id
// ref_fields is a map of fields by mm, modt 
// call callback (docs, modified_docs)
exports.update_docs = function (db, docs, callback) {
    var ids = [], ref_data = {}, path_data = {};

    // keep only docs with ref field
    for (var i = 0, ll = docs.length; i < ll; i++) {
        var d = docs[i];
        
        for (var field_name in d.$ref) {

            var id = d.$ref[field_name]._id;
            if (id) { ids.push(id); }
        }
    }

    if (ids.length === 0) {
        callback(docs, []);
        return;
    }

    function end() {

        var changed_docs = [];
        // 2 - update docs
        for(var i = 0, ll = docs.length; i < ll; i++) {
            var d = docs[i], old_doc = JSON.stringify(d);
            
            for(var field_name in d.$ref) {
                var id = d.$ref[field_name]._id, path, data;
                if(!id) { 
                    d.$ref[field_name] = {};
                    continue; 
                } 
                // ref hasn't been matched
                if(!ref_data[id]) { // id doesn'exists
                    // if unknown mark it but do not remove it
                    d.$ref[field_name] = { "_id" : id,
                                           "state" : "unknown"
                                         };
                    continue;
                }   
                
                d.$ref[field_name] = {"_id":id}; // clean old data

                // set current value in $ref and in the field itself
                data = ref_data[id];	
                d.$ref[field_name][data.modi] = data.label; 
                d[field_name] = data.label; 
                
                // set geoloc
                if (data && data.geoloc) {
                    d.$ref[field_name].geoloc = data.geoloc;
                }             
                
                // set parent labels
                path = path_data[id];

                for (var p = 0; p < path.length; p++) { // @TODO sometimes, error log says that "path" is "undefined"
                    var pid = path[p];
                    data = ref_data[pid];
                    
                    if(data) {
                        d.$ref[field_name][data.modi] = data.label;
                    }
                }
                
                      
            }
            if(JSON.stringify(d) != old_doc) {
                changed_docs.push(d);
            }
        }

        callback(docs, changed_docs);
    }

    // extend ids with parents
    db.view("datamanager", "path", {keys:ids}, function (err, data) {
        for (var j = 0, l = data.rows.length; j < l; j++) {
            var r = data.rows[j],
            id = r.key;
            path_data[id] = r.value.path;
            ids = ids.concat(r.value.path);
        }

        // get label and modi for each id and parents
        var t = Commons.unique(ids).map(function (e) { return [0, e]; });
        // get ref data
        db.view("datamanager", "label", {
            keys : t,
            reduce : false },
                function (err, view_data) { 

                    if (err) { 
                        log("ERROR", err);
                        end(); return; 
                    }
                    for (var j = 0, l = view_data.rows.length; j < l; j++) {
                        var r = view_data.rows[j],
                        id = r.key[1];
                        
                        if (!r.value.modi) { continue; }
                        ref_data[id] = r.value;
                    }
                    end();
                });
    });
    
};





// update ref data in all docs linked with any of the changed_doc_ids
exports.update_ref = function (db, changed_doc_ids, callback) {
    
    callback = callback || function () {};
    if (!changed_doc_ids || !changed_doc_ids.length) {
        log('no ref to update');
        callback();
        return; // nothing to do
    }
    changed_doc_ids = Commons.unique(changed_doc_ids);

    //log('using "sons" view on ' + changed_doc_ids.length + ' ids');
    // get all sons
    db.view("datamanager", "sons", { keys: changed_doc_ids }, function (err, sons_data) {

        var son_ids = sons_data.rows.map(function (row) {
            return row.id;
        });
        changed_doc_ids = Commons.unique(changed_doc_ids.concat(son_ids)); 
        //log('using "refs" view on ' + changed_doc_ids.length + ' ids');
        db.view("datamanager", "refs", {
            keys : changed_doc_ids,
            include_docs : true }, function (err, data) {
                var docs = data.rows.map(function (e) { return e.doc; });
                exports.update_docs(db, docs, function (docs, changed_docs) {
                    // recursive call
                    if (changed_docs.length > 0) {

                        // check label template
                        Label.set_label_template(db, changed_docs, {}, function () {
                            // save changes
                            db.bulkDocs({docs:changed_docs, "all_or_nothing":true}, function () {
                                // recursive update
                                var changed_ids = changed_docs.map(function (e) {return e._id;});
                                exports.update_ref(db, changed_ids, callback);
                            });
                        });

                    } else {
                        callback();
                    }
                });
            });
    });
};




////////////////////// MATHCHING FUNCTIONS //////////////////////////////


function _match_mm_modt (db, mm_modt, fields_to_up, cb) {
    // get docs
    var docs = [];
    // apply ref data to documents of modt
    // get docs
    db.view("datamanager", "by_mod", {
        key : mm_modt,
        include_docs : true,
        reduce : false},
            function (err, by_modt) {
                // get docs
                docs = by_modt.rows.map( function (e) { return e.doc; }  );

                if(!docs.length) { cb(0); return; }
                
                // Match by value
                exports.match_docs(
                    db, docs, function (docs, changed_docs) {
                        // apply ref data
                        exports.update_docs(db, changed_docs, 
                                            function (docs, changed_docs) {
                                                // save changes
                                                db.bulkDocs({docs : changed_docs,
                                                             "all_or_nothing":true}, 
                                                            function () {
                                                                var cpt = changed_docs.length;
                                                                log("Save " + cpt + " docs");
                                                                cb(cpt);
                                                            }
                                                           );
                                           });
                }, fields_to_up);
           });
}


// Match ref data in mm
// mm_filter is an object containing the id of the referential data to update
exports.match_mm = function(db, mm, cb, mm_filter) {

    log("Matching ref for mm " + mm.name);

    // get the field to update
    var fields_to_up = MM.get_ref_fields(mm, mm_filter),
    doccpt = 0, callcpt = 1;

    function next(cpt) {
        callcpt --;
        doccpt += cpt;
        if(!callcpt) { cb(doccpt); }
    }

    // get the list of modt to process
    for (var mm_modt in fields_to_up) {
        callcpt++;
        _match_mm_modt(db, mm_modt.split(","), fields_to_up, next);
    }                       
    next(0);
};



// update ref id for a set of docs 
// call callback(docs, changed_docs)
// ref_fields is a map of field to update sorted by [mm,modt] 
// Note : the docs are not saved !!
exports.match_docs = function (db, docs, callback, ref_fields) {
    var ref_keys = [];
    // get the values to expand
    if(!docs) { callback(); }
    
    var docs_ok = [], ok = false;
    for (var i = 0, l = docs.length; i < l; i++) {
        var d = docs[i];
        if(!d.$modi) { continue; } // keep only doc with $modt
        
        var key = [d.$mm, d.$modt];
        docs_ok.push(d);
        for (var field_name in ref_fields[key]) {
            var ref_mm = ref_fields[key][field_name],
            v = d[field_name];
            if(v) { v = v + ""; v = v.trim();}
            
            ref_keys.push([ref_mm, v]);
            ok = true;
        }
    }
    
    if(!ok) { // nothing to update
        callback(docs, []);
        return;
    }
    _match_docs_ref_keys(db, ref_keys, docs_ok, ref_fields, callback);
};
    

// set ref id for a list of docs and for the given referential keys
// ref_fields is a map of fields by mm, modt 
// ref_keys is a list of ref value by mm ref 
var _match_docs_ref_keys = function (db, ref_keys, docs, ref_fields, callback) {
    ref_data = {}, label_by_id = {};

    // get id for label
    var t = Commons.unique(ref_keys);

    db.view("datamanager", "label", { 
        keys : t,
        reduce : false },
            function (err, view_data) { 
                if(err) { log(err); return; }
  
                for (var j = 0, l = view_data.rows.length; j < l; j++) {
                    var r = view_data.rows[j], k = r.key;
                    ref_data[k] = r.id;
                }
                
                // 2 - update docs
                var changed_docs = [];
                for(var i = 0, ll = docs.length; i < ll; i++) {
                    var d = docs[i],
                    k = [d.$mm, d.$modt], changed = false;
                    for(var field_name in ref_fields[k]) {
                        var ref_mm = ref_fields[k][field_name],
                        id = ref_data[[ref_mm, d[field_name]]];
                        d.$ref = d.$ref || {};
                        
                        /*if(!d.$ref[field_name] || !d.$ref[field_name]._id 
                           || d.$ref[field_name]._id != id) {}*/
                        d.$ref[field_name] = {_id:id};
                        changed = true;
                    }
                    if(changed) { changed_docs.push(d); }
                }
                callback(docs, changed_docs);

            });
};






