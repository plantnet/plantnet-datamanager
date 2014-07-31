function (callback, e, params) {
    var id = params.id,
        old_id = params.oldid,
        app = $$(this).app;

    function compareFrom(original_doc) {

        app.db.view("datamanager/conflicts", {
            key : [0, id],
            reduce : false,
            include_docs : true,
            cache: JSON.stringify(new Date().getTime()),
            success : function (data) {
                if (! data.rows.length) {
                    //$.log('There are no conflits for this doc');
                    $.pathbinder.go('/viewlist/conflict/0/0/conflict/0');
                    return;
                }
                var docs = data.rows.map(function (e) { return e.doc; });
                var mms = docs.map(function (e) { return e.$mm; });

                app.db.allDocs({
                    keys : mms,
                    include_docs : true,
                    success : function(mms) {
                        var mms_by_id = {};
                        for (var i = 0; i < mms.rows.length; i++) {
                            var d = mms.rows[i].doc;
                            mms_by_id[d._id] = d;
                        }

                        callback(id, original_doc, docs, mms_by_id);
                    }
                });
            },
            error : function () {
                $.log('Cannot open conflicts view!');
            }
        });
    }

    app.db.openDoc(id, {
        success : compareFrom,
        error : function () {
            app.libs.utils.showInfo("Cannot open new id, opening old id");
            app.db.openDoc(old_id, {
                success : compareFrom,
                error : function () {
                    app.libs.utils.showError("Cannot load doc");
                }
            });
        }
    });
}