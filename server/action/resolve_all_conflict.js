// force to resolve all conflict

function resolve_all_conflict(db) {
    
    // get all conflict
    db.view("datamanager", "conflicts", {reduce:false}, 
            function (err, data) {
                if (err) {
                    q.send_error(err);
                    return;
                }

                var to_delete = [];
                for (var i = 0; i < data.rows.length; i++) {
                    var r = data.rows[i];

                    for (var j = 1; j < r.value.length; j++) {
                        to_delete.push({
                            _id : r.key,
                            _rev : r.value[j],
                            _deleted : true
                        });
                    }

                    db.bulkDocs({docs:to_delete}, function (err, data) {

                        if (err) {
                            q.send_error(err);
                            return;
                        }
                        else {
                            q.send_json({status:"ok"});
                        }
                    });;
                }
            });

}


resolve_all_conflict(q.db);
