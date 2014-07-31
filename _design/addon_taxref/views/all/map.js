function (doc) {
    if (doc.$modi) {
        emit(doc.$mm, {_id:doc._id});
    }
}