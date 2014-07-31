function (doc) {
    emit(doc._id, null); // emit self
    if (doc.$synonym) {
        emit(doc.$synonym, null);
        emit([1, doc._id], {syn : doc.$synonym});
    }
}