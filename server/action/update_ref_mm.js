// UPDATE ALL REF in a MM
// GET params :
// mm : mm_id


// q.db : curent db
// q.data : post data : mm
// q.send_json : return json


var RefUp = require("refup");

function update_ref_mm(db, mm_id) {

    db.getDoc(mm_id, function(err, mm) {
        if(err) { q.send_error(err); return; }
        RefUp.update_mm(db, mm, function (cpt) {
            q.send_json({status : "ok", doc_updated:cpt});
        });
        
    });
}

update_ref_mm(q.db, q.params.mm);

