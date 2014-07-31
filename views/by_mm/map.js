function (doc) {
    // by mod
    if (!doc.$mm || !doc.$modi) { return; }
    
    emit(doc.$mm, { _rev: doc._rev});
}
