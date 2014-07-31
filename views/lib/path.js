var exports = exports || {}; // allow import as !code macro

exports.build_id = function (doc) {

    if(!doc.$index_tpl) { return ""; }
    
    var parent = {}, prefix = "parent";
    for (var p = doc.$path.length - 1; p >= 0; p--) {
        // consider new id
        parent[prefix] = doc.$path[p];
        parent[prefix] = parent[prefix] ? parent[prefix].split("##")[1] : "";
        prefix += ".parent";
    }

    parent.mt = doc.$modt;
    parent.mi = doc.$modt;

    var res = doc.$index_tpl.replace(/\${([^{}]+)}/g, 
        function(wmatch, fmatch) {
            if (fmatch == '_attachments') {
                var atkeys = [];
                if (doc._attachments) {
                    for (var at in doc._attachments) {
                        atkeys.push(at);
                    }
                }
                if (doc.$attachments) {
                    for (var at in doc.$attachments) {
                        atkeys.push(at.substring(at.lastIndexOf('/') + 1, at.length));
                    }
                }
                atkeys.sort();
                return atkeys.join(', ');
            } else {
                return doc[fmatch] || parent[fmatch] || "";
            }
        });
    // prepend always mm_id
    var new_id = doc.$mm.slice(8) + "##" + res;
    new_id = new_id.trim().toLowerCase().replace("?", "µ");
    return new_id;
}


// return first non null parent (unless null_parent is true)
// accepts strings for old_style _ids, and whole doc for new style hierarchy ($path)
exports.get_parent = function (input) {

    if (typeof input == 'object') { // whole doc
        if (input.$path) {
            if (input.$path.length) {
                // return last non-empty parent (because parents may be optional!), or first
                for (var i = (input.$path.length - 1); i >= 0; i--) {
                    if (input.$path[i]) {
                        return input.$path[i];
                    }
                }
                return '';
            } else {
                return '';
            }
        } else {
            if (input._id) {
                return _get_parent_from_id(input._id);
            } else {
                return '';
            }
        }
    } else { // old style _id (parent##id)
        _get_parent_from_id(input);
    }
};

// get parent from old style _id (parent##id)
var _get_parent_from_id = function (id) {

    var sp = id.split("##");
    do { // ignore empty parent
        sp.length -= 1;
    } while (sp.length && sp[sp.length - 1] == "");
    if(sp.length <= 1) { // return empty string if no parent
        return '';
    }
    return sp.slice(0, sp.length).join("##");
};


// useful for smart parent change (same modt but different modi)
exports.emit_label = function(doc, chmodt_by_modi) {

    if (doc.$label) {
        // smart parent autocomplete
        if (chmodt_by_modi && chmodt_by_modi[doc.$modi]) {
            for (var i = 0, l = chmodt_by_modi[doc.$modi].length; i < l; i++) {
                var child_modt = chmodt_by_modi[doc.$modi][i];
                emit ([child_modt, doc.$label], {syn: doc.$synonym, modi: doc.$modi});
            }
        }
    }
};