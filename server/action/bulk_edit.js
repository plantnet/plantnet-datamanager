// bulk edit
// change a field in a set of doc or in a mm
// param :
//   mm : mm_id ,
//   mod : mod,
//   doc_ids : [ids],
//   fields : { f1 : v1 : f2, v2... }

var Label = require("label"),
UID = require("uid");


// return true if the doc has been changed
function edit_doc(doc, fields) {
    var changed = false;
    for (f in fields) {

        if(doc[f] && doc[f] !== fields[f]) {
            doc[f] = fields[f];
            if(!doc[f]) { delete doc[f];}
            changed = true;
        }
    }
    return changed;
}

// check fields to change
function parse_fields(fields) {
    var ret = {};

    for (f in fields) {
        if(f[0] != "_" && f[0] != "$") { 
            ret[f] = fields[f];
        }
    }
    return ret;
}

// edit all doc of a mm
function edit_docs (rows, fields, cb) {

    var docs = [], doc_cache = {};

    rows.forEach(function (e) {
        doc_cache[e.doc._id] = e.doc;

        if(edit_doc(e.doc, fields)) {
            docs.push(e.doc);
        }
    });

    Label.set_label_template(db, docs, doc_cache, function () {
        db.bulkDocs({docs:docs, "all_or_nothing" : true}, function (err, data) {
            UID.update_ids(db, function (ret) {});
            cb(err, data);
        });
    });
    
}

function get_docs_mm(mm, mod, fields, cb) {
    db.view("datamanager", "by_mod", {
        key : [mm, mod],
        reduce : false,
        include_docs : true,
        stale : ok
    }, function (err, data) {
        if(err) { cb (err); return; }
        edit_docs(data.rows, fields, cb);
    });

}

function get_docs_ids(ids, fields, cb) {
    db.allDocs({
        keys : ids,
        include_docs : true,
        stale : "ok"
    }, function (err, data) {
        if(err) { cb (err); return; }
        edit_docs(data.rows, fields, cb);
    });
}


function bulk_edit(mm_id, mod, ids, fields) {

    log(ids);
    try {
        fields = JSON.parse(fields);
        ids = ids.split(",");
    } catch (x) {
        q.send_error({"error" : "bad request", "reason" : x}); 
        return;
    }

    var view_param;
    fields = parse_fields(fields);

    function end(err, data) {
        if (err) {
            q.send_error(err); return;
        }
        q.send_json({status:"ok", doc_updated : data.length});
    }

    if (mm_id && mod) {
        get_docs_mm(mm_id, mod, fields, end);
    } else if(ids && ids.length) {
        get_docs_ids(ids, fields, end);
    } else { // nothing to edit
        q.send_json({status:"ok", doc_updated : 0});
        return;
    }
}


bulk_edit(q.params.mm, q.params.mod, q.params.doc_ids, q.params.fields);
