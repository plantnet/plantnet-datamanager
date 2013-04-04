// web service check_data
//
// check data integrity
// _dm/db/datamanager/check_data?mm=mm_id

// add $path in all docs in a mm


// get parent id list
// if include_id is true include doc_id
var get_path = function (doc_id, include_id) {
    if(!doc_id) { return []; }

    var sp = doc_id.split("##"), ret = []; 

    var l = sp.length;
    if(!include_id) { l--; }
    for (var i = 1; i < l; i++) { // ignore i=0 since id start with mm##
        if(!sp[i]) { ret.push(""); } // empty parent
        else {
            var id = sp.slice(0, i + 1).join("##");
            ret.push(id);
        }
    }  
    return ret;
};



function save(docs) {
    if(docs.length === 0) { q.send_json("ok - nothing to bulk save"); return;}
    //save docs
    db.bulkDocs({docs:docs}, function(err, res) {
        //log('bulk saved ' + docs.length + ' docs');
        if(err) {
            log('error when bulk saving', err);
            q.send_error("error when bulk saving" + err);
        }
        end();
    });
}

function idtopath(db, mm_id) {
    // get docs without $path
    db.view("datamanager", "path", {
        key : [0],
	include_docs : true
    }, function (err, r) {
        if(!err) {
            var to_save = [];
            log('recalculating $path for ' + r.rows.length + ' docs');
            r.rows.forEach(function (d) {
                if(!d.doc.$path) {
                    d.doc.$path = get_path(d.doc._id);
                    to_save.push(d.doc);
                }
            });
            save(to_save);
        }
    });
}

function end() {
    log('ending, all ok');
    q.send_json('ending, all ok');
}

idtopath(q.db, q.params.mm);