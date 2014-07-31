// force to resolve all conflict

function resolve_all_conflict(db) {
    // get all conflict
    db.view("datamanager", "conflicts", {reduce:false, endkey:[], inclusive_end:false},
        function (err, data) {
            if (err) {
                q.send_error(err);
                return;
            }

            var revs = {};

            var cpt = 0;
            for (var i = 0; i < data.rows.length; i++) {
                var r = data.rows[i];
                cpt += r.value.length;
            }

            //get data (doc + meta)
            for (var i = 0; i < data.rows.length; i++) {
                var r = data.rows[i];
                revs[r.key]=[];
                for (var j = 0; j < r.value.length; j++) {
                    db.getDoc(encodeURIComponent(r.key), r.value[j], function(error, doc){
                        if(error){
                            q.send_error(error);
                            return;
                        }
                        else{
                            //ony doc with meta (date created_at or edited_at)
                            if(doc.$meta && (doc.$meta.created_at || doc.$meta.edited_at)) {
                                revs[doc._id].push(doc);
                            }
                        }
                        next();
                    });
                    
                }
            }

            function next(){
                cpt--;
                if(cpt <= 0) {
                    var to_delete = [];

                    //sorting revisions by date
                    for (var doc_id in revs) {
                        if(revs[doc_id].length > 1) {
                            //sorting desc (01.01.2014 > 02.02.2013)
                            revs[doc_id].sort(function(a, b){
                                date_a = a.$meta.edited_at ? a.$meta.edited_at : a.$meta.created_at;
                                date_b = b.$meta.edited_at ? b.$meta.edited_at : b.$meta.created_at;
                                return new Date(date_b) - new Date(date_a);
                            });
                            
                            //find doc to delete
                            for (var d = 1; d < revs[doc_id].length; d++) {
                                to_delete.push({
                                    _id : revs[doc_id][d]._id,
                                    _rev : revs[doc_id][d]._rev,
                                    _deleted : true
                                });
                            }
                        }
                    }

                    if (to_delete.length > 0) {
                        //delete
                        db.bulkDocs({docs:to_delete}, function (err, data) {
                            if (err) {
                                    q.send_error(err);
                                return;
                            }
                            else {
                                q.send_json({status:"ok"});
                            }
                        });
                    }
                    else{
                        q.send_error('Unable to resolve conflicts by date');
                        return;
                    }
                }
            }
        }
    );
}

resolve_all_conflict(q.db);