// manage uid

var Commons = require("commons");

// compute doc id
// id is build mm_id##uid
var _compute_id = function (doc) {

    if(!doc.$index_tpl) {
        return doc._id;
    }

    var parent = {},
        prefix = "parent";
    for (var p = doc.$path.length - 1; p >= 0; p--) {
        var parentid = doc.$path[p];
        // consider new id
        parent[prefix] = parentid;
        parent[prefix] = parent[prefix] ? parent[prefix].split("##")[1] : "";
        prefix += ".parent";
    }

    //parent.mm = doc.$mm.slice(8);
    parent.mt = doc.$modt;
    parent.mi = doc.$modt;

    var res = doc.$index_tpl.replace(/\${([^{}]+)}/g, 
        function(wmatch, fmatch) {
            return doc[fmatch] || parent[fmatch] || ""; 
        }
    );

    // prepend always mm_id
    var new_id = doc.$mm.slice(8) + "##" + res;
    new_id = new_id.trim().toLowerCase().replace("?", "µ");

    return new_id;
};

// update synonyms and refs and remove old doc
// id_map : old_id -> { new_id : xxx, old_rev : xxx}
var _up_syns_and_remove = function (db, id_map, cb) {

    var old_ids = [],
        doc_to_save = [],
        doc;

    for (var old_id in id_map) {
        old_ids.push(old_id);
        var del_doc = {
            _id : old_id,
            _rev : id_map[old_id].old_rev,
            _deleted : true
        };
        doc_to_save.push(del_doc);
    }

    if(!old_ids.length) {
        log('no old_ids to upsyns, returning');
        cb();
        return;
    }

    // get doc to update
    var ids = [];
    db.view("datamanager", "linked_id", {
        keys : old_ids
    }, function(err, data) {
        ids = data.rows.map(function (e) {
            return e.id;
        });
        ids = Commons.unique(ids);
        // download the docs
        db.allDocs({
                keys : ids,
                include_docs : true
            }, function (err, alldocs) {
                log(alldocs.rows.length + ' docs fetched');
               for (var i = 0; i < alldocs.rows.length; i++) {
                   doc = alldocs.rows[i].doc;
                   var save = false;
                   if(doc && !id_map[doc._id]) {  // do not process old_id docs
                       // synonyms
                       if(id_map[doc.$synonym]) {
                           doc.$synonym = id_map[doc.$synonym].new_id;
                           save = true;
                       }
                       // ref links
                       for (var f in doc.$ref) {
                           var ref = doc.$ref[f]._id;
                           if(id_map[ref]) {
                               doc.$ref[f] = {
                                   "_id" : id_map[ref].new_id
                               };
                               save = true;
                           }
                       }
                       // $path
                       for (var p = 0; p < doc.$path.length; p++) {
                           var pid = doc.$path[p];
                           if(id_map[pid]) {
                               doc.$path[p] = id_map[pid].new_id
                               save = true;
                           }
                           
                       }
                       if(save) {
                           doc_to_save.push(doc);
                       }
                   }
               }
               log('launching bulkdocs on ' + doc_to_save.length + ' docs to save');
               db.bulkDocs({
                   docs : doc_to_save,
                   "all_or_nothing": true
                }, cb);
           });
    });
};


var _migrate_ids = function (db, id_map, cb) {

     // no duplicated ids -> do copies
    var cpt = 1;

    function next (err, data) {
        cpt --;
        if (!cpt) {
            log('migration phase ended - starting _up_syns_and_remove()');
            //log(id_map);
            // update $path, $syns and $ref
            _up_syns_and_remove(db, id_map, cb);
        }
    }

    for (var old_id in id_map) {
        cpt ++;
        var new_id = id_map[old_id].new_id;
        db.copyDoc(encodeURIComponent(old_id), new_id, function (oid) { 
            return function (err, data) { // make a closure to keep old_id
                if (err) {
                    log(err); // error in copy
                    delete id_map[oid]; // do not delete doc since copy has failed
                }
                next();
            };
        }(old_id)); // end copyDoc
    }
    next();
}


/**
 * try to correct ids
 * ignore_ids is a map with id to ignore 
 * this function is called recursively while there is an id to update
 */
exports.update_ids = function (db, cb, ignore_ids) {

    log('NEW UPDATE_ID PASS');
    var id_map = {},
        ignore_ids = ignore_ids || {};

    // get wrong id
    db.view("datamanager", "conflicts", {
        startkey : [0],
        endkey : [0, {}],
        reduce : false
    }, function (err, data) {
        log('updating ' + data.rows.length + ' docs, ignoring ' + ignore_ids.length);
        var nb_to_process = 0;
        for (var i = 0; i < data.rows.length; i++) {
            var r = data.rows[i],
            new_id = r.value.new_id,
            old_id = r.id;

            if (!ignore_ids[old_id]) {
                id_map[old_id] = {new_id:new_id, old_rev:r.value._rev};
                ignore_ids[old_id] = true;
                nb_to_process++;
            }
        }
        log('preparing to migrate ' + nb_to_process + ' docs');
        if (nb_to_process > 0) {
            _migrate_ids(db, id_map, function () {
                //recursive call to modify sons of changed doc
                log('migration ok');
                exports.update_ids(db, cb, ignore_ids);
            });
        } else {
            cb(); // final unlock
        }
    });
};

/**
 * update uid on a doc
 * calls cb with { status: "error", reason: error reason } in case of error
 
 * calls cb with { status: "ok" } in case of success
 * calls cb with { status: "error", reason: error reason } in case of error
 */
exports.save_doc = function (db, doc, cb) {

    var new_id = _compute_id(doc);

    if(doc._id && new_id != doc._id) { // move doc if necessary
        db.getRev(doc._id, function (err, rev) {
            if (rev !== doc._rev) {
                cb({
                    status: 'error',
                    reason: 'id conflict'
                });
            } else {
                db.copyDoc(encodeURIComponent(doc._id), new_id, function (err, data) {
                    if (err) { // duplicate id
                        cb({
                            status: 'error',
                            reason: 'copyDoc failed - conflict'
                        });
                        return;
                    } else {
                        // update docs impacted by the new id
                        var id_map = {};
                        id_map[doc._id] = {
                            new_id: new_id,
                            old_rev:doc._rev
                        };

                        doc._id = data.id;
                        doc._rev = data.rev;

                        _up_syns_and_remove(db, id_map, function () {
                            cb(null, doc);
                        });
                    }
                });
            }});
    } else { // nothing to do
        doc._id = new_id;
        cb(null, doc);
    }
};




// returns an index template
exports.get_index_template = function (doc, mm) {
    var tpl = mm.modules[doc.$modt].index_tpl || "";
    if (tpl && !mm.modules[doc.$modt].label_tpl) { tpl = ""; } // index_tpl is in fact a label_tpl
    return tpl.trim();
};

// computes the id of a doc
exports.build_id = _compute_id;

