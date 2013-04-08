function (doc) {

    if(doc.$meta) {
        var time = doc.$meta.edited_at || doc.$meta.created_at,
        author = doc.$meta.edited_by || doc.$meta.created_by;
        emit(Date.parse(time), {author:author, time:time, label:doc.$label});
    }
    
}