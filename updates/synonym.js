function (doc, req) {
    var ret = {status : "ok"};

    delete doc.$synonym;

    if(req && req.body) {
        try {
            param = JSON.parse(req.body);
            doc.$synonym = param.synid;
        } catch (e) {}
        
    } 

    return [doc, JSON.stringify(ret)];
}