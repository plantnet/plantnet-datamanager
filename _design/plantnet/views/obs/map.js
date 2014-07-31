function (doc) {

    if (doc.$mm == "_design/mm_887cfdb7a2bcc93466ef9a6daa0008b5"
        && doc.$modi == ".0") {

        emit([doc._id, 0], {_id:doc._id});
        return;
    }

    if (doc.$mm == "_design/mm_887cfdb7a2bcc93466ef9a6daa0008b5"
        && doc.$modi == ".0.1") {

        emit([doc.$path[0], 1], {_id:doc._id});
        return;
    }
}
