function (doc) {

    var app = $$(this).app;

    // Attachments
    var attachments = [], a;
    for (a in doc.$attachments) {
        var attachment = doc.$attachments[a];
        var url = attachment.url;
        attachments.push({
            name:a, url:url, 
            url_img : url,
            embedded:false
        });
    }

    for (a in doc._attachments) {
        var attachment = doc._attachments[a];
        var url = app.db.uri + $.couch.encodeDocId(doc._id) + "/" + a;
        attachments.push({
            name:a,
            url:url, 
            url_img : attachment.content_type.match('image.*') ? url : "img/attachment.png",
            embedded:true
        });
    }

    return { 
        _id : doc._id,
        _rev : doc._rev,
        doc : doc,
        attachments : attachments
    }; 

}