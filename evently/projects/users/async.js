function (callback) {
    var db = $$(this).app.db;

    $.couch.userDb(
        function (userDb) {
            userDb.allDocs({
                startkey : "org.couchdb.user:",
                endkey : "org.couchdb.user:zzzzzzzzzzzzzz",
                include_docs : true,
                success : function (users) {
                    callback(users);
                }});
        });
}