var utils = require("vendor/datamanager/lib/utils");

var create_node = function (doc, parent, count, root) {

    var m = root.mm.structure[doc.$modi][0];
    var s = {
        _id : doc._id,
        parent_id : parent._id,
        label : doc.$label,
        issyn: !!doc.$synonym,
        type_label : root.mm.structure[doc.$modi][3] || root.mm.modules[m].name,
        count : count[doc._id] || 0,
        //data : format_doc(doc, root.mm),
        modi : doc.$modi,
        submodis : root.modis[doc.$modi],
        sons : []
    };
    root.by_id[doc._id] = s;

    return s;
};

// fill tree struct with docs_by_parent
var _expand_struct = function (docs_by_parent, current_struct, count, root) {

    var docs = docs_by_parent[current_struct._id];
    if(!docs) {
        return;
    }

    // save existings sons
    var existing_docs = {};
    for (var i = 0, l = current_struct.sons.length; i < l; i++) {
         var d = current_struct.sons[i];
         existing_docs[d._id] = d;
    }

    for (var i = 0; i < docs.length; i++) {
        var d = docs[i].doc, s = existing_docs[d._id];
        d.$label = docs[i].value.label;
        if(!s) {
            s = create_node(d, current_struct, count, root);  
            current_struct.sons.push(s);
        }  else {
            s.label = d.$label;
            s.issyn = !!d.$synonym;

        }
        // recursive call
        _expand_struct(docs_by_parent, s, count, root);
    }
    // sort sons
    current_struct.sons.sortBy('label');
};


// refresh tree struct
exports.apply_changes = function (db, tree_struct, changes, onSuccess, onError) {

    var deleted = [], ids = [], mm = tree_struct.mm, mm_id = mm._id.slice(8);
    changes.forEach(function (e) {

        
        if(e.id.slice(0, mm_id.length) !== mm_id) { 
            return; 
        }

        if(e.deleted) {
            deleted.push(e.id);
        } else {
            ids.push(e.id);
        }
    });

    exports.remove(tree_struct, deleted);
    exports.expand_docs(db, ids, tree_struct, onSuccess, onError);
}

// expand all nodes
exports.expand_all = function (db, tree_struct, onSuccess, onError, show_synonyms) {

    var mm_id = tree_struct.mm._id,
        limit = 10000;

    var time = JSON.stringify(new Date().getTime());

    // reinit data
    tree_struct.sons = [];

    db.view('datamanager/label', {
        startkey : [1, mm_id],
        endkey : [1, mm_id, {}],
        reduce : false,
        include_docs :true,
        cache : time,
        limit : limit,
        success : function (tree_data) {
            if (! show_synonyms) { // eliminate synonyms
                tree_data.rows = tree_data.rows.filter(function (row) {
                    return (! row.doc.$synonym);
                });
            }
            var len = tree_data.rows.length;
            if (len === limit) {
                onError("Too many rows. Please use search tool or expand nodes manually");
                return;
            }
            if (len > 1000) {
                var res = confirm("More than 1000 rows to display. Continue ?");
                if (!res) { return; }
            }
           _expand_tree(db, tree_struct, tree_data, onSuccess, onError);

        }});

    return false;
};


var _expand_tree = function (db, tree_struct, tree_data, onSuccess, onError) {

    var mm_id = tree_struct.mm._id,
    ids = [];
    for(var i = 0, l = tree_data.rows.length; i < l; i++) {
        ids.push([1, mm_id, tree_data.rows[i].id]);
    }
    var time = JSON.stringify(new Date().getTime());
    // count
    db.view('datamanager/label', {
        group : true,
        keys : ids,
        cache : time,
        success: function (count_data) {
            var count = {};
            for (var c = 0, l = count_data.rows.length; c < l; c++) {
                var d = count_data.rows[c];
                if(d) {
                    count[d.key[2]] = d.value;
                }
            }

            var docs = tree_data.rows,
            docs_by_parent_id = {};

            // organise by parent
            for (var i = 0, l = docs.length; i < l; i++) {
                var parent_id = docs[i].value.parent || docs[i].key[2] || "";
                if(!docs_by_parent_id[parent_id]) {
                    docs_by_parent_id[parent_id] = [];
                }
                docs_by_parent_id[parent_id].push(docs[i]);
                

            }
            _expand_struct(docs_by_parent_id, tree_struct, count, tree_struct);

            onSuccess();
        }
    });
};

exports.expand_node = function (db, tree_struct, parent_id, onSuccess, onError, show_synonyms) {

    var mm = tree_struct.mm,
        parent = tree_struct.by_id[parent_id],
        limit = 10000;

    // save already retrieved sons
    var existing_docs = {};
    for (var i = 0, l = parent.sons.length; i < l; i++) {
        var d = parent.sons[i];
        existing_docs[d._id] = d;
    }
    parent.sons = [];
    var time = JSON.stringify(new Date().getTime());

    db.view('datamanager/label', {
        key : [1, mm._id, parent_id], 
        include_docs : true,
        cache : time,
        reduce : false,
        limit : limit,
        success : function (tree_data) {

            if (! show_synonyms) { // eliminate synonyms
                tree_data.rows = tree_data.rows.filter(function (row) {
                    return (! row.doc.$synonym);
                });
            }

            var len = tree_data.rows.length;
            if (len === limit) { // == ? wtf? should be >
                onError("Too many rows. Please use search tool or expand nodes manually");
                return;
            }
            if (len > 1000) {
                var res = confirm("More than 1000 rows to display. Continue ?");
                if (!res) { return; }
            }
            // get ids
            var ids = [];
            for(var i = 0, l = tree_data.rows.length; i < l; i++) {
                ids.push([1, mm._id, tree_data.rows[i].id]);
            }

            // count
            db.view('datamanager/label', {
                group : true,
                cache : time,
                keys : ids,
                success: function (count_data) {
                    var count = {};
                    for (var c = 0, l = count_data.rows.length; c < l; c++) {
                        var d = count_data.rows[c];
                        if(d) {
                            count[d.key[2]] = d.value;
                        }
                    }

                    var docs = tree_data.rows;
                    for (var i = 0, l = docs.length; i < l; i++) {
                        var doc = docs[i].doc;
                        doc.$label = docs[i].value.label;
                        var s = create_node(doc, parent, count, tree_struct);
                        parent.sons.push(s);

                        // reattach sons for already expanded sons
                        if(existing_docs[s._id]) {
                            s.sons = existing_docs[s._id].sons;
                        }
                    }
                    // sort sons
                    parent.sons.sortBy('label');
                    parent.count = parent.sons.length;
                    onSuccess();
                }
            });
        }
    });

    return false;
};

// expand only docs and parent
exports.expand_docs = function (db, doc_ids, tree_struct, onSuccess, onError) {

    var mm_id = tree_struct.mm._id, ids = [];

    // do not add sons of doc_ids
        // ids = doc_ids.map(function(e) {
        //     return [1, mm_id, e];
        // });

    ids = doc_ids.map(function(e) {
        return [0, e];
    });


    //ids.push([1, mm_id, ""]); // add root docs

    var time = JSON.stringify(new Date().getTime());

    // // add parents
    db.view("datamanager/path", {
        keys : doc_ids,
        success : function (data) {
            data.rows.forEach(function (e) {
                var p = e.value.path;
                ids = ids.concat(p.map(function (e) {
                    return [0, e];
                }));
            });

            ids = ids.unique();
            // get docs
            db.view('datamanager/label', {
                keys : ids, 
                reduce : false,
                include_docs :true,
                cache : time,
                success : function (tree_data) {
                    _expand_tree(db, tree_struct, tree_data, onSuccess, onError);
                }
            });
        },
        error : function (err) {
            onError(err);
        }
    });

    return false;
};

exports.move = function (ts, src_id, dst_id) {

    var src = ts.by_id[src_id];

    // remove in parent
    this.remove(ts, [src_id]);
    // add in dst
    if(src) {
        var dst = ts.by_id[dst_id];
        if(!dst.count || dst.count === dst.sons.length) { // the node is expanded
            // !! refresh node
            dst.sons.push(src);
            dst.count++;
            dst.sons.sortBy("label");
        }
    }
};

exports.remove = function (ts, ids) {

    for (var c = 0; c < ids.length; c++) {
        var id = ids[c];

        // remove in parent
        var parent_id = ts.by_id[id].parent_id;
        var ps = ts.by_id[parent_id],
            ret;

        for (var i = 0, l = ps.sons.length; i < l; i++ ) {

            if(ps.sons[i]._id === id) {
                ret = ps.sons[i];
                ps.sons.splice(i, 1);
                ps.count = ps.sons.length;
                break;
            }
        }
    }

    for (var c = 0; c < ids.length; c++) {
        var id = ids[c];
        delete ts.by_id[id];
    }
};