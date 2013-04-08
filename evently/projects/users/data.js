function (users) {

    var user_names, user_docs = [];

    user_names = users.rows.map(
        function(e) {
            var name = e.id.split(":")[1],
            ret = { 
                id : e.id,
                name : name,
                display_name : name.toLowerCase()
            };
            var doc = e.doc;
            user_docs.push(doc);
            for(var r = 0; r < doc.roles.length; r++) {
                ret[doc.roles[r]] = true;
            }
            return ret;
        });

    $$(this).app.data.user_docs = user_docs;
    user_names.sortBy("display_name");

    return {
        users : user_names
    };
}