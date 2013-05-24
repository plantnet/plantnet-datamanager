var commons = require("commons");

// compute doc label
// doc contains $path 
// doc.$var_by_deg contains variable name to replace by parent degree
// doc.$var_by_deg[0]= ["parent.a", "parent.b"]
var _compute_tpl = function (tpl, doc, doc_cache) {

    if(!tpl) {
        return '';
    }
    var tmp = {};

    doc.$var_by_deg.forEach(function (e, i) {
        if(!e) {
            return;
        }
        var _id = doc.$path[doc.$path.length - 1 - i],
        d = doc_cache[_id];
        
        if(!d) {
            return;
        }
        variables = e;

        // get parent values
        variables.forEach(function (v) {
            f = v.replace(/parent\./g, ""); // name without parent
            tmp[v] = d[f];
        });
    });

    var res = tpl.replace(/\${([^{}]+)}/g, 
                          function(wmatch, fmatch) {
                              var d = '';
                              if (fmatch == '_attachments') {
                                  if (doc._attachments) {
                                      for (var at in doc._attachments) {
                                          d += at + ', ';
                                      }
                                  }
                                  if (doc.$attachments) {
                                      for (var at in doc.$attachments) {
                                          d += at.substring(at.lastIndexOf('/') + 1, at.length) + ', ';
                                      }
                                  }
                                  // remove last ', '
                                  if (d.length > 0) {
                                      d = d.substring(0, (d.length - 2));
                                  }
                              } else {
                                  d = doc[fmatch] || tmp[fmatch] || '';
                                  d += '';
                              }
                              //return d.trim(); 
                              return d;
                          }
                         );
    return res.trim();
};


// return a label template
exports.get_label_template = function (doc, mm) {
    return mm.structure[doc.$modi][4] 
        || mm.modules[doc.$modt].label_tpl
        || mm.modules[doc.$modt].index_tpl; // ensure backward compatibility
}

// set label template of docs
// doc cache contains already retrieved docs,
// call cb (err, to_save)
exports.set_label_template = function (db, docs, doc_cache, cb) {

    log('preparing to set label templates on ' + docs.length + ' docs');

    doc_cache = doc_cache || {};
    var ids_to_retrieve = [];

    // ensure doc_cache is correctly filled
    docs.forEach(function (doc) {
        doc_cache[doc._id] = doc;
    });
    
    // analyse each doc
    docs.forEach(function (doc) {
        // get tpl and path
        var ltpl = doc.$label_tpl;
        path = doc.$path;

        doc.$var_by_deg = [];
        doc.$path = path;

        // parse template : find each variable
        // and calculate needed parent index
        var re = /(\$\{([^\}]*)\})+/g,
            result,
            result2,
            deg;

        while (result = re.exec(ltpl)) {
            var varname = result[2]; // result between curly brackets

            // count the number of parent and get the id to retrieve
            result2 = varname.match(/(parent\.)/g);
            if(result2) {
                deg = result2.length - 1; 
                var _id = path[path.length - deg - 1]; 
                
                if (!_id) {
                    continue;
                }
                if (!doc_cache[_id]) {
                    ids_to_retrieve.push(_id);
                };

                // store var name by degree
                doc.$var_by_deg[deg] = doc.$var_by_deg[deg] || [];
                doc.$var_by_deg[deg].push(varname);
            }
        }
    }); // end docs foreach

    function next() {
        var to_save = [];
        docs.forEach(function (doc) {
            var label = _compute_tpl(doc.$label_tpl, doc, doc_cache);
            delete doc.$var_by_deg;
            if (label != doc.$label || doc.$to_save) { //save only changed doc
                delete doc.$to_save
                doc.$label = label;
                to_save.push(doc);
            }
        });

        if (cb) {
            log('launching cb() on ' + to_save.length + ' docs to save');
            cb(err, to_save);
        }
    }

    if (ids_to_retrieve.length === 0) { // nothing to retrieve
        next();
    } else { // get parent data if needed
        ids_to_retrieve = commons.unique(ids_to_retrieve);
        log('we have ' + ids_to_retrieve.length + ' ids to retrieve');
        db.allDocs({
            keys : ids_to_retrieve,
            include_docs : true}, 
                   function (err, parents) {
                       // store by _id
                       if (!err) {
                           log('trying to put ' + parents.rows.length + ' parent docs in cache');
                           for (var i = 0; i < parents.rows.length; i++) {
                               var d = parents.rows[i].doc;
        	               if (!d) {
        		           // generally means that this doc was deleted
                                   log('id qu existe pas', parents.rows[i]);
                               } else {
                                   doc_cache[d._id] = d;
        	               }
                           }
                       }
                       next();
                   });
    }
}

// update label of sons of docs
// doc_id : root
// ltpl : label template of root
exports.update_labels = function (db, doc_ids, cb) {

    var doc_cache = {}, docs = [];
    db.view("datamanager", "label_sons", {
        keys : doc_ids,
        include_docs : true
    },
            function (err, data) {
                if (err) { cb(err): return; }
                
                // put doc in cache
                for (var i = 0; i < data.rows.length; i++) {
                    var d = data.rows[i].doc;
                    doc_cache[d._id] = d;
                    docs.push(d);
                }

                // if (ltpl) {
                //     doc_cache[doc_id].$label_tpl = ltpl; // set label tpl of root
                // }

                // call update label for each
                exports.set_label_template(db, docs, doc_cache, cb);
                
            }
           );
}

