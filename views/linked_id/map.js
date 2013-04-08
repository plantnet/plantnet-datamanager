function (doc) {
    // emit external ids (refs, synonyms, children)
    var ids = {};
    
    for (var field in doc.$ref) {
        var id = doc.$ref[field]._id;
        if (id) {
            ids[id] = true;
        }
    }

    if (doc.$synonym) {
        ids[doc.$synonym] = true
    }

    if (doc.$path) {
        for (var p = 0; p < doc.$path.length; p++) {
            ids[doc.$path[p]] = true;
        }
    }

    for (var id in ids) {
        emit(id, null);
    }
}