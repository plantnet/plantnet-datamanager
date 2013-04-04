function (doc, req) {
    var ret = {status : "ok", doc : doc, req:req};
    doc.$mm = req.query.mm;
    return [doc, JSON.stringify(ret)];
}