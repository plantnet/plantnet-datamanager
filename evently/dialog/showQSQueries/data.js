function (doc) {
    var app = $$(this).app,
        c_user = app.userCtx.name;

    for (var i = 0; i < doc.queries.length; i++) {
        if (doc.queries[i].user == c_user) {
            doc.queries[i].deletable = true;
        }
    }

    return {
        queries:doc.queries
    };
};