// copy mm data


var Copy = require("copy");

function copy_mm_data (db, old_mm_id, new_mm_id) {
    Copy.copy_mm_data (db, old_mm_id, new_mm_id, function (err, data) {
        if (err) {
            q.send_error(err);
        } else {
            q.send_json(data);
        }
    });
}


copy_mm_data(q.db, q.params.old_mm, q.params.new_mm);
