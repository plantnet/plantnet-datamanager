function (doc) {

    if (!doc.$modi || !doc._attachments) { return; }

    for (var basename in doc._attachments) {

        if(doc._attachments[basename].content_type.slice(0,5) !== "image") { continue; }
        
        emit([doc.$mm, doc.$modi], {
            name : basename,
            type : doc.type,
            obs_id : doc.$path[0]
        });

    }
}