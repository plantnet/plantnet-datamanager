// save doc
// POST request
// the doc should contains $mm, $modt, $modi
// $path, $index_tpl and $label are calculated

// url param : 
//      parent : parent id

// post data : the doc to save


// q.db : curent db
// q.data : post data : mm
// q.send_json : return json


var Label = require("label"),
    UID = require("uid"),
    Lock = require('lock'),
    Path = require('path'),
    RefUp = require("refup");

// build path depending of modi
// pmodi is the modi of the parent
function _get_doc_path_opt(path, doc, mm, pmodi) {

    var parent_modi = mm.structure[doc.$modi][1];
    while (parent_modi && parent_modi !== "." && (!pmodi || parent_modi !== pmodi) ) {
        path.push(null);
        parent_modi = mm.structure[parent_modi][1]
    }

    return path;
}


// return the path given the parent_id
function get_doc_path(db, doc, mm, parent_id, cb) {

    // if undefined do not change path
    if(parent_id === undefined && doc.$path) { cb(doc.$path); return;}
    if(!parent_id || parent_id === "null") { 
        cb(_get_doc_path_opt([], doc, mm)); 
        return;
    }

    var path, pmodi;
    db.view("datamanager", "path", {key:parent_id}, function (err, data) {
        if (!err && data.rows.length && data.rows[0].value) {
            path = data.rows[0].value.path;
            pmodi = data.rows[0].value.modi;
            path.push(parent_id);
        } else {
            path = [];
        }

        // complete path with optional rank
        // if path.length is null it means that parent is invalid
        path = _get_doc_path_opt(path, doc, mm, path.length ? pmodi : null);
        cb(path);
    });
}

// function call at the end
// data.id is the id of the saved doc
// function finish(data, cb) {          
//        Lock.protect(q.db, "update_mm", 60 * 60, function (unLockCb) {
//            log('lock acquired : update_mm');
//            UID.update_ids(q.db, function (err) {
//                   if (err) {
//                       unLockCb(err);
//                   } else {
//                       unLockCb(null, {
//                           status: 'ok',
//                           id: data.id
//                       });
//                   }
//               });         
//        }, cb);
// }
   
// do not execute update_ids since it will be executed by up_changes
function finish(data, cb) {
    cb(null, { status: 'ok',
               id: data.id
    });
}   
   
/**
 * calls cb with { status: "ok", id: doc's new id } in case of success
 * calls cb with { status: "error", reason: error reason } in case of error
 */
function save_doc(db, doc, parent_id, cb) {

    var changed_path = false;


    // load mm
    db.getDoc(doc.$mm, function(err, mm) {
        if(err) {
            log('error when opening mm');
            cb({
                status: 'error',
                reason: 'error when opening mm in save_doc'
            });
            return;
        }

        // get path
        get_doc_path(db, doc, mm, parent_id, function (path) {
            // check for multi user conflict
            doc.$index_tpl = UID.get_index_template(doc, mm);

            if(path !== doc.$path) {
                doc.$path = path; 
                changed_path = true;
            }

            // first change the id of the doc before saving data
            UID.save_doc(db, doc, function (err, doc) {

                if (err) {
                    log('error in UID.savedoc');
                    cb(err);
                    return;
                }

                // rewrite info since it has'nt be saved
                doc.$label_tpl = Label.get_label_template(doc, mm);
                doc.$index_tpl = UID.get_index_template(doc, mm);
                doc.$path = path;

                // calculate $ref
                RefUp.update_docs(db, [doc], function () {
                    // calculate $label
                    Label.set_label_template(db, [doc], {}, function () {
                        // pass doc._id only if doc is not new
                        db.update("datamanager", "authortime", 
                          doc._rev ? encodeURIComponent(doc._id) : null,
                          doc, 
                          function (err, data) {
                              if (err) {
                                  log('error when updating in save_doc');
                                  cb({
                                      status: 'error',
                                      reason: 'Conflict on ID. A doc with same id already exists.'
                                  });
                                  return;
                              } else {
                                  // change sons path
                                  if (changed_path) {
                                      Path.update_sons_path(db, doc._id, doc.$path, function() {
                                          finish(data, cb);
                                      });
                                  } else {
                                      finish(data, cb);
                                  }
                              }
                          });
                    });
                });
            });
        });
    });
}

/*q.start_stream('toto.txt');
q.send_chunk('salut les amis');
q.end_stream();*/
/*q.send_error({
    msg: 'couscous poulet'
});*/
/*q.send_json({
    status: 'ok',
    msg: 'tralala'
});*/
/*q.send_json({
    msg: 'couscous poulet'
});*/

Lock.try_lock(q.db, "update_mm", function (is_ok) {
    if (!is_ok) {
        q.send_error({
            msg: "Structure is currently edited. Please try later"
        });
        return;
    }
    
    /**
     * sends JSON { id: doc's new id } in case of success
     * sends error { msg: error message } in case of error
     */
    save_doc(q.db, q.data, q.params.parent, function (err, data) {

        if (err) {
            q.send_error({
                msg: err.reason || ''
            });
        } else {
            q.send_json({
                id: data.id
            });
        }
    });
    
})

