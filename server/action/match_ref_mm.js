// MATCH REF of a MM
// GET params :
// mm


// q.db : curent db
// q.data : post data : mm
// q.send_json : return json


var RefUp = require("refup");

function match_ref_mm(db, mm_id, filter_mm_id) {

    var filter = null;
    if(filter_mm_id) {
        filter = {}
        filter[refmm._id] = true;
    }

    db.getDoc(mm_id, function(err, mm) {

        if(err) { q.send_error(err); return; }

        RefUp.match_mm(db, mm, function (err, cpt) {
            if (err) {
                q.send_error(err);
                return
            }
            q.send_json(cpt + " docs updated");
        }, filter);
        
    });
}

match_ref_mm(q.db, q.params.mm, q.params.filter_mm);

