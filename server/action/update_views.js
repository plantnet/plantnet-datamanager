// UPDATE ALL VIEWS

function call_views(db, ddocs) {
    ddocs = ddocs.rows;
    for (var i = 0; i < ddocs.length; i++) {
        var name = ddocs[i].doc._id.split("/")[1];
        for (var v in ddocs[i].doc.views) {
            //log('start indexing ' + name + '/' + v);
            db.view(name, v, {limit:1, reduce:false, stale:"ok"},
                    function (err, r) {});
            break; // call only first views
        }
    }
    q.send_json("start indexing " + ddocs.length + " ddocs");

};

function update_views(db) {
    db.allDocs({   startkey : "_design/",
	           endkey : "_design/\ufff0",
	           include_docs : true,
                   cache : JSON.stringify(new Date().getTime())
               }, function (err, r) {
                   log('start updating ' + r.rows.length + ' views');
                   call_views(db, r);
               });
}

update_views(q.db);
