function (doc) {
    // return related doc for an id

    if (doc.$type === "selection") {
        emit(0, null);

    } else if (doc.$modi) {

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

        // source doc
        emit(doc._id, {_attchs : attchs});

        if (doc.$path) {
            for (var i = 0; i < doc.$path.length; i++) {
                var id = doc.$path[i];
                if (!id) {
                    continue;
                }
                // sons
                emit(id, { path: doc.$path, _attchs : attchs});
                // parents
                emit(doc._id, { path: doc.$path, _id: id, _attchs : attchs});
            }
        }
    }
}