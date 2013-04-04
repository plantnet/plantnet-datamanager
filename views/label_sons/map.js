function (doc) {

    // emit itself even if $label_tpl is not set
    emit(doc._id, {/*_id:doc._id,*/ ltpl:doc.$label_tpl});

    // return sons of a doc with a dependance on the label template
    if(!doc.$label_tpl) { return; }

    var
    path = doc.$path; 
    //path.reverse(); // !! first element is first parent

    var prefix = "${parent.";
    for (var i = path.length - 1; i >=0 ; i--) { 
        var p = path[i];
        if(p && doc.$label_tpl.indexOf(prefix) >= 0) {
            emit(p, {ltpl:doc.$label_tpl});
        }
        prefix += "parent.";
    }
}