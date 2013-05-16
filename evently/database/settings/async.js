function(callback) {
    var app = $$(this).app,     
        db = app.db,
        users, 
        secu, 
        addons_by_key, 
        mms, 
        roles,
        sessionUserName;

    function next() {
        if (users != undefined && secu != undefined && 
            addons_by_key != undefined && mms != undefined && 
            roles != undefined) {

            callback(users, secu, addons_by_key, mms, roles, sessionUserName);
        }
    }
    
    $.couch.session({ 
        success : function (r) {
            sessionUserName = r.userCtx.name;
            roles = r.userCtx.roles || [];    
            next();
        },
        error : function () {
            sessionUserName = '';
            roles = [];
            next();
        }});
    
    // get design docs -> to improve to avoid to get _design/datamanager
    db.allDocs({
        startkey: '_design/',
        endkey: '_design/\ufff0',
        include_docs: true,
        cache: JSON.stringify(new Date().getTime()),
        success: function(data) {
            addons_by_key = {};
            mms = [];
            for (var i = 0; i < data.rows.length; i++) {
                var doc = data.rows[i].doc;
                if (doc._id.slice(8, 10) == 'mm') {
                    mms.push(doc);
                } else if (doc._id.slice(8, 13) == 'addon') {
                    for (var key in doc) {
                        addons_by_key[key] = doc[key];
                    }
                }
            }
            next();
        },
        error : function () {
            addons_by_key = {};
            mms = [];
            next();
        }
    });
    
    $.getJSON(
        db.uri + '_security',
        function(data) {
            secu = data || {};
            next();
        });
    
    app.libs.utils.admin_db(db, 'user_docs', {}, null,
        function (data) {
            users = data;
            next();
        }, function (error) {
            $.log(error);
            users = { rows : [] };
            next();
        });
}