function (doc) {
    // return referring docs _ids sorted by referred docs
    if (!doc.$ref) { return; }
    
    for (var field in doc.$ref) {
        
        var id = doc.$ref[field]._id;
        if (id) {
            emit (id, null /*{_id : doc._id}*/);
        }
    }
}