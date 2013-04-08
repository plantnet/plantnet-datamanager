function (doc, req) {
        
    doc = doc || {};
    var author = req.userCtx.name,
    time = new Date().toString(),
    savedoc = JSON.parse(req.body), 
    ret;
    
    // set id if none
    savedoc._id = savedoc._id || (savedoc.$mm.slice(8) + "##" + req.uuid)

    ret = {
        status : "ok",
        time : time,
        author : author,
        id : savedoc._id
    };

    //check change

    var _id = savedoc._id,
        _rev = savedoc._rev;
    // remove fields before comparison
    delete savedoc._rev;
    delete savedoc._id;
    delete doc._rev;
    delete doc._id;
    delete doc._revisions;

    //ret.savedoc = savedoc;
    //ret.doc = doc;
    
    if(JSON.stringify(savedoc) === JSON.stringify(doc)) {
        return [null, JSON.stringify({status : "no change", id : _id/*, rev: _rev*/ })];
    }
    
    // save doc
    savedoc._id = _id;
    if(_rev) {
        savedoc._rev = _rev;
    } // use old rev to detect conflict

    // set meta data
    if (!savedoc.$meta) {
        savedoc.$meta = {};
    }

    // set time
    if (!savedoc.$meta.created_at) {
        savedoc.$meta.created_at = time;
    } else {
        savedoc.$meta.edited_at = time;    
    }
    
    // set author
    if (!savedoc.$meta.created_by) {
        savedoc.$meta.created_by = author;
    } else {
        savedoc.$meta.edited_by = author;    
    }
    
    return [savedoc, JSON.stringify(ret)];
}