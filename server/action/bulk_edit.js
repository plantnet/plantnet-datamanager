// bulk edit
// change a field in a set of doc or in a mm
// param :
//   mm : mm_id ,
//   mod : mod,
//   doc_ids : [ids],
//   fields : { f1 : v1 : f2, v2... }

var Label = require("label"),
    RefUp = require('refup'),
    UID = require("uid"),
    lib = require('commons');

// tries to see if the value to be set contains '${val}', in which case this
// keyword will be replaced by the current value
function computeValue(doc, fieldName, pattern) {
    var value = pattern; // by default pattern is not a pattern but a value :)
    if (pattern && (typeof pattern == 'string')) {
        if (pattern.search(/\${.+}/) > -1) { // omg it's a pattern
            if (doc[fieldName]) {
                value = pattern.replace('${val}', doc[fieldName]);
            } else {
                value = pattern.replace('${val}', '');
            }
            // values from other fields - @TODO manage type conversions here - bonjour la lèrega
            value = value.replace(/\${([^{}]+)}/g, function(wmatch, fmatch) {
                return doc[fmatch] || '';
            });
        }
    }
    return value;
}

// return true if the doc has been changed
function edit_doc(doc, fields) {
    var changed = false,
        computedValue;
    for (f in fields) {
        computedValue = computeValue(doc, f, fields[f]);
        if(/*doc[f] &&*/ doc[f] !== computedValue) { // à la limite "if (f in doc)" mais là non, quoi
            doc[f] = computedValue;
            // setting an empty value means deleting the field - beware of what happens
            // with a value of "false" or "0" - can't we put "" either?
            /*if(!doc[f]) {
                delete doc[f];
            }*/
            changed = true;

            if (doc.$ref && doc.$ref[f]) {
                delete doc.$ref[f];
            }
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
function edit_docs(rows, fields, cb) {

    var docs = [],
        doc_cache = {};

    rows.forEach(function (e) {
        doc_cache[e.doc._id] = e.doc;

        if(edit_doc(e.doc, fields)) {
            docs.push(e.doc);
        }
    });

    // rematch
    RefUp.match_docs(db, docs, function () {
        // label
        Label.set_label_template(db, docs, doc_cache, function () {
            db.bulkDocs({docs:docs, "all_or_nothing" : true}, function (err, data) {
                UID.update_ids(db, function (ret) {
                });
                cb(err, data);
            });
        });
    });
}

function get_docs_mm(mm, mod, fields, cb) {
    db.view('datamanager', 'by_mod', {
        key : [mm, mod],
        reduce : false,
        include_docs : true,
        stale : ok
    }, function (err, data) {
        if(err) {
            cb (err);
            return;
        }
        edit_docs(data.rows, fields, cb);
    });
}

function get_docs_ids(ids, fields, cb) {
    db.allDocs({
        keys : ids,
        include_docs : true,
        stale : "ok"
    }, function (err, data) {
        if(err) {
            cb (err);
            return;
        }
        edit_docs(data.rows, fields, cb);
    });
}


function bulk_edit(mm_id, mod, ids, fields) {

    try {
        fields = JSON.parse(fields);
        if (! lib.is_array(ids)) {
            ids = ids.split(",");
        }
    } catch (x) {
        q.send_error({"error" : "bad request", "reason" : x}); 
        return;
    }

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

var params = lib.mergeObjects(q.params, q.data);
//log('params');
//log(params);



//service description
if (q.method == 'OPTIONS') {
    var acceptedMethods = 'POST';
    q.send_options({
        method: 'bulk_edit',
        accepted: acceptedMethods,
        description: 'sets a value in a given field, for many documents as once',
        params: {
            mm: {
                type: 'string',
                description: 'structure id (without "_design/"). If specified along with "mod", will process'
                    + 'all the documents of the given module in the given structure'
            },
            mod: {
                type: 'string',
                description: 'module id, see description for "mm" parameter'
            },
            ids: {
                type: 'array',
                description: 'list of documents ids to process'
            },
            fields: {
                type: 'object',
                description: 'an object with the fields to change as keys, and their respective value pattern as values',
                mandatory: true
            }
        }
    }, acceptedMethods);
} else {
    bulk_edit(params.mm, params.mod, params.doc_ids, params.fields);
}
