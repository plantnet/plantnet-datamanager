function (doc) {
    // return doc with missing refs
    if (!doc.$ref) { return; }
    
    for (var field in doc.$ref) {
        if(!doc.$ref[field]) {
             continue;
        }
        if(!doc.$ref[field]._id || doc.$ref[field].state == "unknown") {
            emit([doc.$mm, doc.$modt, field], {/*_id:doc._id,*/ val:doc[field]});
        }
    }
}
