function (doc) {
    // by mod
    if (!doc.$mm || !doc.$modi) { return; }
    
    emit(doc.$mm, {/*_id : doc._id,*/ _rev: doc._rev});
}
