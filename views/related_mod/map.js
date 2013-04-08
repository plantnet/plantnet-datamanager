function (doc) {

    // return related filtered by [_id, mod]
    if (!doc.$modi) { return; }

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

    // source doc
    emit([doc._id, doc.$modi], { _attchs : attchs});
    emit([doc._id, doc.$modt], null); // are _attchs useful here?

    var modis = doc.$modi.split(".");

    var path = doc.$path; 

    if (path) {
        var cmodi = "." + modis[1];
        for (var i = 0; i < path.length; i++) { 
            var parent_id = path[i];
            if (parent_id) {

                // sons modi
                emit([parent_id, doc.$modi], { _attchs : attchs});
                // parents modi
                emit([doc._id, cmodi], {_id: parent_id, _attchs : attchs});

                // sons modt
                emit([parent_id, doc.$modt], null);
                // parents modt
                emit([doc._id, modis[i+1]], {_id: parent_id});
            }

            // rebuild modi for current parent
            cmodi = cmodi + "." + modis[i + 2];
        } 
    }
}