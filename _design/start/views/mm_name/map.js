function (doc) {
    if (doc._id.slice(0, 10) === '_design/mm') {
        emit(doc.name, null);
    }
}