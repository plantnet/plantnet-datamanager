function(doc, req) {

    var filter_ids = req.query.ids,
        filter_structures = req.query.structures,
        filter_types = req.query.types;

    if (filter_ids && (doc._id in filter_ids)) { return true; }
    if (filter_structures && doc.$mm && (doc.$mm in filter_structures)) {
        if (doc.$type) {
            if (doc.$type in filter_structures[doc.$mm]) {
                return true;
            }
        } else {
            return true;
        }
    }
    if (filter_types && doc.$type (doc.$type in filter_types)) { return true; }

    return false;
}