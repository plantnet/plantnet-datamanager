function (doc) {

    // return related filtered by [parent_id, mod] => return brothers
    if (!doc.$modi) { return; }

    if (!doc.$path) { return; }

    // attachments
    var attchs = [],
        a;
    for (a in doc._attachments) {
        attchs.push(a);
    }
    for (a in doc.$attachments) {
        attchs.push(a);
    }
    if(!attchs.length) {
        attchs = null;
    }

    var parent_id,
        path = doc.$path;

    if (path && path.length > 0) {
        parent_id = path[(path.length - 1)];
        // source doc
        emit([parent_id, doc.$modi], { _attchs : attchs, _id: doc._id});
        emit([parent_id, doc.$modt], { _id: doc._id }); // are _attchs useful here?
    }
}