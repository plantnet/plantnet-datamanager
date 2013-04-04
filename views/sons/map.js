function (doc) {
    if (!doc.$path) { return; }
    var path = doc.$path;     
    for (var i = 0; i < path.length; i++) {
        var p = path[i];
        if(p) {
            emit(p, {_rev: doc._rev});
        }
    }
}