// UPDATE ALL ID and LABELS
// GET params :
// mm : mm_id

// POST param
// mm -> save mm


// q.db : curent db
// q.data : post data : mm
// q.send_json : return json


var Label = require("label"),
    Lock = require("lock"),
    RefUp = require("refup"),
    Uid = require("uid");


function save(docs, cb) {
    log('preparing to bulk save ' + docs.length + ' docs');
    if(docs.length === 0) {
        Uid.update_ids(q.db, cb);
        return;
    }
    //save docs
    q.db.bulkDocs({docs:docs}, function(err, res) {
        if(err) {
            cb(err)
        } else {
            // propagate change in linked docs
            var ids = docs.map(function (e) { return e._id; });
            RefUp.update_ref(q.db, ids, function () {
                Uid.update_ids(q.db, cb);    
            });
        }
    });
}

function update_mm(db, mm, cb) {

        var key = mm._id.slice(8), // remove _design/
            doc_cache = {},
            docs = [],
            label_tpl,
            index_tpl;

        db.allDocs({
            startkey : key,
            endkey : key + "\ufff0",
            include_docs : true
        }, function (err, r) {
            if(!err) {
                log('propagating label / index templates to ' + r.rows.length + ' docs');
                r.rows.forEach(function (e) {
                    doc_cache[e.doc._id] = e.doc;

                    label_tpl = Label.get_label_template(e.doc, mm);
                    index_tpl = Uid.get_index_template(e.doc, mm);

                    if (e.doc.$label_tpl !== label_tpl) {
                        e.doc.$label_tpl = label_tpl
                        e.doc.$to_save = true;
                    }
                    if (e.doc.$index_tpl !== index_tpl) {
                        e.doc.$index_tpl = index_tpl;
                        e.doc.$to_save = true;
                    }
                    docs.push(e.doc);
                });
                Label.set_label_template(db, docs, doc_cache, function (err, docs) {
                    save(docs, cb);
                });
            } else {
                cb();
            }
        });
}

function finish(err, data) {
        if(err) {
            q.send_error(err);
        } else {
            q.send_json({ status: "ok" }); // @TODO return nb of docs updated VS nb of docs requiring an update (some may have failed)
            return;
        }
}


Lock.protect(q.db, "update_mm", 60 * 60, function (unLockCb) {
    log('lock acquired : update_mm');
    
    var mm = q.data; // test if mm has been posted
    if (mm && mm._id) {

        // save mm
        db.saveDoc(mm, function (err, data) {
            if(err) {
                q.send_error(err);
                unLockCb();
                return;
            }
            
            update_mm(q.db, mm, unLockCb);
        });
        
    } else {

        // load mm
        db.getDoc(q.params.mm, function(err, mm) {
            if(err) {
                q.send_error(err);
                unLockCb();
                return;
            }

            update_mm(q.db, mm, unLockCb);
        });
    }
}, finish);



