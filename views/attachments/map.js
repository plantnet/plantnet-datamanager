function (doc) {
    // attachments (images)

    if (doc.$modi) {
        if (doc._attachments) {
            for (var k in doc._attachments) {
                if(doc._attachments[k].content_type.slice(0,5) === "image") {
                    var enc = encodeURIComponent(doc._id);
                    // basename computation - slow!
                    var basename = k;
                    var lio = basename.lastIndexOf('/');
                    if (lio > -1) {
                        basename = basename.substr(lio + 1);
                    }
                    emit([doc.$mm, doc._id, basename], {url : enc + "/" + k, fn : k}); // imgaes by doc
                    emit([doc.$mm, doc.$modi, basename], {url : enc + "/" + k, fn : k}); // gallery by modi
                    emit([doc.$mm, doc.$modt, basename], {url : enc + "/" + k, fn : k}); // gallery by modt
                    emit([1, doc.$mm, basename], {url : enc + "/" + k, fn : k}); // full gallery
                    // gallery by doc, not sorted (to be able to use "keys" list in view call), no matter which mm
                    emit([3, doc._id], {url : enc + "/" + k, fn : k});
                    // gallery by parent
                    if (doc.$path) {
                        for(var i=0, l=doc.$path.length; i < l; i++) {
                            if (doc.$path[i]) {
                                emit([2, doc.$path[i], basename], {url : enc + "/" + k, fn : k});
                            }
                        }
                    }
                    emit([2, doc._id, basename], {url : enc + "/" + k, fn : k});
                    // a doc is considered the parent of its attachments
                }
            }
        }

        if(doc.$attachments) {
            for (var k in doc.$attachments) {
                // basename computation - slow!
                var basename = k;
                var lio = basename.lastIndexOf('/');
                if (lio > -1) {
                    basename = basename.substr(lio + 1);
                }
                emit([doc.$mm, doc._id, basename], {url : k}); // imgaes by doc
                emit([doc.$mm, doc.$modi, basename], {url : k}); // gallery by modi
                emit([doc.$mm, doc.$modt, basename], {url : k}); // gallery by modt
                emit([1, doc.$mm, basename], {url : k}); // full gallery
                // gallery by doc, not sorted (to be able to use "keys" list in view call), no matter which mm
                emit([3, doc._id], {url : k });
                // gallery by parent
                if (doc.$path) {
                    for(var i=0, l=doc.$path.length; i < l; i++) {
                        if (doc.$path[i]) {
                            emit([2, doc.$path[i], basename], {url : k});
                        }
                    }
                }
                emit([2, doc._id, basename], {url : k});
                // a doc is considered the parent of its attachments
            }
        }
    }

}