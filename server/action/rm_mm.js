// !! stub, doesn't work at the moment
var delete_mm_docs = function(db, mm_id, cb) {
    var docs;
    
    db.view('datamanager', 'by_mm', {
        key : mm_id,
        reduce : false
    }, 
            function(err, rdocs) {
                docs = rdocs.rows.map(function(row) {
                    return {
                        _id: row.id,
                        _rev: row.value._rev,
                        _deleted : true
                    };
                });
                
                if (!docs.length) {
                    cb(null, []);
                }
                
                db.bulkSave({docs : docs, 'all_or_nothing' : true }, cb);
            });
}

var delete_mm = function (db, mm_id, cb) {
    db.getRev(mm_id, function(err, ref) {
        if(err) {
            cb(err); return;
        }
        db.removeDoc(mm_id, rev, cb);
    });
}

var delete_mm_vq = function (db, mm_id, cb) {
    var doc = [];
    db.view('datamanager', 'views_queries', {
        startkey: ['v', mm_id],
        endkey: ['v', mm_id, {}],
        include_docs: true },
            function(err, views) {
                views.rows.forEach(function(e) {
                    docs.push(e.doc);
                    e.doc._deleted = true;
                }); 

                db.view('datamanager', 'views_queries', {
                    startkey: ['q', mm_id],
                    endkey: ['q', mm_id, {}],
                    include_docs: true },
                        function(err, views) {
                            views.rows.forEach(function(e) {
                                docs.push(e.doc);
                                e.doc._deleted = true;
                            }); 

                            
                            if (!docs.length) {
                                cb(null, []);
                            }
                            
                            db.bulkSave({docs : docs, 'all_or_nothing' : true }, cb);

                        });
            });

}

function delete_mm_all(db, mm_id) {
    delete_mm_docs(db, mm_id, function (err, data) {

        if(err) { q.send_err(err); return; }

        delete_mm_vq(db, mm_id, function (err, data) {

            if(err) { q.send_err(err); return; }

            delete_mm(db, mm_id, function (err, data) {
                if(err) { q.send_err(err); return; }
                q.send_json("ok");
            });
        });
    });
}

delete_mm_all(q.db, q.params.mm);
