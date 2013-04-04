exports.dump = function (db, onSuccess) {
    var docs = {}, d, cpt = 0, url;

    function end() {
        cpt --;
        if(cpt <=0) { onSuccess(docs); }
    }

    cpt ++;
    db.allDocs({include_docs : true,
                success : function (rows) {
                    rows = rows.rows;
                    for (var i = 0, l = rows.length; i < l; i++) {
                        d = rows[i].doc;
                        docs[d._id] = d;
                        if(d._attachments) {
                            for (var a in d._attachments) {
                                cpt ++;
                                url = "/" + db.name + "/" + encodeURI(d._id) + "/" + encodeURI(a);
                                $.ajax({url : url,
                                        success : (function(doc, att) {
                                                       return function (data) {
                                                           // encode data
                                                           doc._attachments[att].data = data;
                                                           delete doc._attachments[att].stub;
                                                           end ();
                                                       }})(d, a),
                                        error : end
                                       });
                            }
                        }
                    }
                    end();
                }
               });
};