function(callback) {
    var container = $(this),
        db_name = container.data('db-name');

    if (db_name) {
        var db = $.couch.db('datamanager');
        db.allDocs({
            key : '_design/datamanager',
            success : function(results) {
                var rev = results.rows[0].value.rev;
                var dm_last_version = parseInt(rev.substr(0, rev.indexOf('-')));
                
                db = $.couch.db(db_name);
                db.allDocs({
                    key : '_design/datamanager',
                    success : function (db_results) {
                        if (db_results.rows[0].value.rev) {
                            var db_rev = db_results.rows[0].value.rev;
                            var noddm = false;
                            if (db_rev == '0-0') {
                                noddm = true;
                            }
                            var db_last_version = parseInt(db_rev.substr(0, db_rev.indexOf('-')));
                            if (db_last_version < dm_last_version) {
                                callback({
                                	db_name: db_name,
                                	need_to_update: true,
                                	noddm: noddm
                                });
                            }
                        }
                    },
                    error : function () {
                    	;
                    }
                });
            },
            error : function(){
                ;
            }
        });
    }
}