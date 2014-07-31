/**
 * Returns referring docs _ids, sorted by [referring mm, (referring modt), referring modi, referring field, referred doc _id]
 */
function (doc) {

    if (!doc.$ref) {
        return;
    }

    for (var field in doc.$ref) {

        var id = doc.$ref[field]._id;
        if (id) {
            emit ([doc.$mm, doc.$modi, field, id], null);
            emit ([doc.$mm, doc.$modt, field, id], null); // font chier ces modt
        }
    }
}