function (doc) {

    if (doc.$type === "selection") {
        emit(0, null /*{_id: doc._id}*/);
        return;
    }
    // by mod
    if (!doc.$mm || !doc.$modi) { return; }

    var attchs = [], a;
    for (a in doc._attachments) {
        attchs.push(a);
    }
    for (a in doc.$attachments) {
        attchs.push(a);
    }
    if(!attchs.length) {
        attchs = null;
    }

    emit([doc.$mm, doc.$modt], {/*_id : doc._id,*/ _rev : doc._rev, _attchs : attchs});
    emit([doc.$mm, doc.$modi], {/*_id : doc._id,*/ _rev : doc._rev, _attchs : attchs});
}