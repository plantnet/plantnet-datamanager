// REBUILD PATH
// GET params :
// mm : mm_id

var Path = require("path");

function rebuild_path(db, mm_id) {
    Path.update_path(db, mm_id, function (err, data) {
        if (err) {
            q.send_error(err);
        } else {
            q.send_json(data);
        }
    });
    
}

rebuild_path(q.db, q.params.mm);
