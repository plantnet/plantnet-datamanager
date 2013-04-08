// COPY lib


function correct_docs (db, ids, sliced_old_mm_id, sliced_new_mm_id, cb) {
    db.allDocs({keys:ids, include_docs:true}, 
               function (err, data) {
                   
                   var docs = data.rows.map( function (e) {
                       var d = e.doc;
                            
                       // update data
                       d.$mm = "_design/" + sliced_new_mm_id;

                       // $path
                       d.$path = d.$path.map(function (e) {
                           return e ? e.replace(sliced_old_mm_id, sliced_new_mm_id) : e;
                       });

                       // $syn
                       if (d.$synonym) {
                           d.$synonym = d.$synonym.replace(sliced_old_mm_id, sliced_new_mm_id);
                       }
                       
                       return d;
                   });

                   db.bulkDocs({docs:docs, 'all_or_nothing': true}, cb);
               });

}

exports.copy_mm_data = function (db, old_mm_id, new_mm_id, cb) {

    var sliced_old_mm_id = old_mm_id.slice(8),
    sliced_new_mm_id = new_mm_id.slice(8),
    ids = [];

    db.view("datamanager", "by_mm", {
        key: old_mm_id,
        reduce: false,
    }, function(err, data) {
        if(err) { cb(err); return; }

        var l = data.rows.length, cpt = l;
        for (var i = 0; i < l; i++) {
            var did = data.rows[i].id,
            new_id = did.replace(sliced_old_mm_id, sliced_new_mm_id);
            ids.push(new_id);

            db.copyDoc(encodeURIComponent(did), new_id, function (err, data) {
                cpt --;
                if (cpt <= 0) {
                    correct_docs(db, ids, sliced_old_mm_id, sliced_new_mm_id, cb);
                }
            });
        }
    });
}