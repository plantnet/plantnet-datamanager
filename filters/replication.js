function(doc, req) {

    var filter_params = req.query;
    
    if (doc._id in filter_params) { return true; }
    if (doc.$mm && doc.$mm in filter_params) { return true; }
    if (doc.$type && doc.$type in filter_params) { return true; }
    
    return false;
}