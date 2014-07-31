function (doc) {

    if(!doc.$mm) { return; }
    
    p = doc.$path;
    emit(doc._id, {path:p, modi:doc.$modi});

    if (!doc.$path) {
        emit([0], null); // doc without $path
    } else if (doc.$path.length) {
        for (var i = 0; i < doc.$path.length; i++) {
            if (doc.$path[i] && doc.$path[i].slice(0,3) !== 'mm_') {
                emit([0], null); // doc with old $path
                break;
            }
        }
    }
}