function(doc) {
    // return conflict revisions
    if(doc._id.slice(0, 8) === "_design/") {
        return;
    }
    if (doc._conflicts) {
        emit(doc._id, [doc._rev].concat(doc._conflicts));
        return;
    }

    // emit [0, id] : wrong _id

    if(!doc.$index_tpl) { return; }

    var plib = require("views/lib/path"),
    new_id = plib.build_id(doc);;

    // emit only wrong id sorted by new_id
    if (doc._id != new_id) { 
        emit([0, new_id], { new_id: new_id, _rev: doc._rev });
    }
}