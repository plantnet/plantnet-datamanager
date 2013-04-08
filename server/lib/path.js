

// update the path of the son of doc_id
// save the docs
exports.update_sons_path = function (db, doc_id, doc_path, cb)  {

    var docs = [];
    db.view("datamanager", "sons", {
        key: doc_id,
        include_docs: true
    }, function (err, data) {
        if(err) {
            cb(err);
            return;
        } else {
            data.rows.forEach(function (e) {
                var old_path = e.doc.$path;
                e.doc.$path = doc_path.concat(e.doc.$path.slice(doc_path.length));
                if(old_path !== e.doc.$path) {
                    docs.push(e.doc);
                }
            });

            db.bulkDocs({docs:docs, "all_or_nothing":true}, function (err, data) {
                cb(err,data);
            });
        }
    });
};

// update all path of mm_id (without _design/)
exports.update_path = function (db, mm_id, cb) {
    
    var path_by_id = {}, to_save = [], ids = [];

    
    db.view("datamanager", "path", {            
        startkey : mm_id,
        endkey : mm_id + "\ufff0"
    }, function (err, data) {
        if(err) { cb (err); return }
        
        data.rows.forEach(function (e) {
            path_by_id[e.key] = e.value.path;
            ids.push(e.key);
        });

        ids.sort(function (a,b) {
            return path_by_id[a].length - path_by_id[b].length;
        });

        for (var i = 0; i < ids.length; i++) {
            var doc_id = ids[i];
            var p = path_by_id[doc_id], parent = null, l = p.length - 1, path = p;

            while (!parent && l > 0) {
                parent = p[l];
                l--;
            }
            
            if(!parent) { continue; }

            if(!path_by_id[parent]) {
                log({error :"ERROR wrong path", parent: parent, id:doc_id})
                continue;
            }

            var parent_path = path_by_id[parent];
            p = p.slice(0, parent_path.length);

            if (parent_path + "" !== p + "") {
                path_by_id[doc_id] = parent_path.concat(path.slice(parent_path.length));
                log({origin:path, corrected:path_by_id[doc_id]})

                to_save.push(doc_id);
            }
        }

        db.allDocs({keys:to_save, include_docs:true}, function (err, data) {
            if (err) { cb(err); return }
            var docs = [];
            
            data.rows.forEach(function (e) {
                e.doc.$path = path_by_id[e.doc._id]
                docs.push(e.doc);
            });

            db.bulkDocs({docs:docs}, cb);

        });
        
    });
           
}