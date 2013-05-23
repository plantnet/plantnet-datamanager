function(doc, req) {

    var filter_ids = req.query.ids,
        filter_structures = req.query.structures,
        filter_types = req.query.types;

    if (filter_ids && (doc._id in filter_ids)) { // structures design docs or individual ids (regular docs, selections)
        return true;
    }
    if (filter_structures && doc.$mm && (doc.$mm in filter_structures)) {
        if (doc.$type) { // view or query definition
            if (doc.$type in filter_structures[doc.$mm]) {
                return true;
            }
        } else { // regular data doc in structure
            if ('data' in filter_structures[doc.$mm]) {
                return true;
            }
        }
    }
    if (filter_types && doc.$type (doc.$type in filter_types)) { // all queries, views, selections...
        return true;
    }

    return false;
}