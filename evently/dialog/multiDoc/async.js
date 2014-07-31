function (callback, e, ids) {
    
    var app = $$(this).app,
        time = JSON.stringify(new Date().getTime());

    app.db.allDocs({
        keys : ids,
        cache : time,
        include_docs : true,
        success : function(docs) {
            docs = docs.rows.map(function (e) { return e.doc; });
            var mms = docs.map(function (e) { return e.$mm; });

            app.db.allDocs({
                keys : mms,
                cache : time,
                include_docs : true,
                success : function(mms) {
                    var mms_by_id = {};
                    for (var i = 0; i < mms.rows.length; i++) {
                        var d = mms.rows[i].doc;
                        mms_by_id[d._id] = d;
                    }

                    callback(docs, mms_by_id);
                }
            });
        }
    });
}