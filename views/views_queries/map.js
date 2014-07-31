function (doc) {
    // return view and query object sorted by mm and by name    
    if (doc.$type === "view") {
        emit(["v", doc.$mm, doc.name], { name : doc.name});
    }
    else if (doc.$type === "query") {
        emit(["q", doc.$mm, doc.name], { name : doc.name});
    }
}