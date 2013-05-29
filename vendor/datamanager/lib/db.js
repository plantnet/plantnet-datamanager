var utils = require('vendor/datamanager/lib/utils');

// call calback(dbs) 
exports.get_accessible_dbs = function(no_desc, callback) {

    if (!callback && typeof no_desc === 'function') {
        callback = no_desc;
        no_desc = false;
    }

    var accessible_dbs = [], dbsLength, dm_last_version;

    function process_db(dbName, next) {
        var db = $.couch.db(dbName);
        db.allDocs({
            key : '_design/datamanager',
            success : function(results) {
                var isDatamanagerDb = !!results.rows.length;
                if (isDatamanagerDb) {
                    var rev = results.rows[0].value.rev;
                    if (dbName == 'datamanager') {
                        dm_last_version = parseInt(rev.substr(0, rev.indexOf('-')));
                        next();
                    } else {
                        var d = {
                            name : dbName,
                            rev : rev
                        };

                        accessible_dbs.push(d);

                        if (!no_desc) {
                            db.openDoc(
                                '$wiki', 
                                {
                                    success : function(wiki) {
                                        d.desc = wiki.desc;
                                        next();
                                    },
                                    error : next
                                });
                        } else {
                            next();
                        }    
                    }
                } else {
                    next();
                }
            },
            error : next
        });
    }

    function end() {
        dbsLength --;
        //$.log(dbsLength);
        if (dbsLength <= 0) {
            accessible_dbs.sortBy('name');
            // mark db as updatable or not
            accessible_dbs = accessible_dbs.map(function(e) {
                var e_rev = parseInt(e.rev.substr(0, e.rev.indexOf('-')));
                e.update = (e_rev < dm_last_version);
                return e;
            });
            callback(accessible_dbs);
        }
    }

    $.couch.allDbs({
        success : function(dbs) {
            dbsLength = dbs.length;
            if(!dbsLength) { end(); }

            for (var i = 0; i < dbs.length; i++) {
                var dbName = dbs[i],
                    isUserDb = (dbName[0] === '_') ? false : true;
                if (isUserDb) {
                    process_db(dbName, end);
                } else {
                    end();
                }
            }
        }, 
        error : function () {}
    });

};


function _process_db(db, next) {
     var cdb = $.couch.db(db.name);
     cdb.allDocs({
        key : '_design/datamanager',
        success : function(results) {
            var isDatamanagerDb = !!results.rows.length;
            if (isDatamanagerDb) {
               db.rev = results.rows[0].value.rev;
               cdb.openDoc('$wiki', {
                    success : function(wiki) {
                        db.desc = wiki.desc;
                        next();
                     },
                     error : next
                });
            } else {
              next();
           }
        },
        error : next
    });
}

function _get_dbs(roles, cb) {

     var all_dbs = [], dbsLength, dm_last_version;

     function end() {

         dbsLength --;
         //$.log(dbsLength);
         if (dbsLength <= 0) {
             all_dbs.sortBy('name');
             
             // get last revision of datamanager
              var db = $.couch.db('datamanager');
              db.allDocs({
                     key : '_design/datamanager',
                     success : function(results) {
                         var rev = results.rows[0].value.rev;
                         dm_last_version = parseInt(rev.substr(0, rev.indexOf('-')));

                         // mark db as updatable or not
                         all_dbs = all_dbs.filter(function(e) {
                             if (!e.rev) {
                                 return false;
                             }
                             var e_rev = parseInt(e.rev.substr(0, e.rev.indexOf('-')));
                             e.update = (e_rev < dm_last_version);
                             return true;
                          });
                         cb(all_dbs);
                     },
                     error : function(){
                         cb(all_dbs);
                     }});
          }
     }

     dbsLength = 1;
     var isAdmin = roles.indexOf('_admin') >= 0;
     
     $.couch.allDbs({
             success : function(dbs) {

                 for (var i = 0; i < dbs.length; i++) {
                     var dbName = dbs[i];                     
                     if (dbName[0] !== '_' && dbName !== 'datamanager') {
                         d = { name : dbName, 
                               publicdb : dbName.indexOf('public') >= 0,
                               user : isAdmin || roles.indexOf(dbName) >=0
                             };
                         
                         if (d.publicdb || d.user) {
                             all_dbs.push(d);
                             dbsLength ++;
                             _process_db(d, end); 
                         }                 
                     }
                 }
                 end();
             }, 
             error : end
         });
}

// return cb(dbs)
exports.get_accessible_dbs_fast = function (r, cb) {
    
    var roles;
    roles = r.userCtx.roles || []; 
    roles = roles.map(function (e) { return e.split('.')[0]; }).unique();   
    _get_dbs(roles, cb);
}


// create a new db and replicate an other
exports.copy_db = function (dbName, src_url, onSuccess, onError) {
    $.couch.replicate(dbName, src_url, {    
           success : onSuccess,
           error : function () {
               var errorMsg = "Cannot copy database. An unknown error has occured.";
               onError(errorMsg);
           }}, {} );
};


// create db. Use service if necessary
exports.create_db = function(dbName, desc, source, userName, onSuccess, onError) {

    dbName = dbName.toLowerCase();
    var onCreateDbSuccess = function() {
            newDb = $.couch.db(dbName)
            var wiki = {
                _id:'$wiki',
                desc: desc
            };
            newDb.saveDoc(wiki);
            onSuccess();
            
        },
    onCreateDbError = function(data) {
        // try to do it without the service
        $.couch.replicate("datamanager", dbName, {    
            success : onCreateDbSuccess,
            error : function () {
                var errorMsg = "Cannot create database. An unknown error has occured.";
                if (data && data.responseText) {
                    data = $.parseJSON(data.responseText);
                    errorMsg = data.reason;
                }
                onError(errorMsg);
            }}, {doc_ids : ["_design/datamanager"], create_target:true} );       
    };
    
    $.couch.allDbs({
        success : function(dbs) {
            if (dbs.indexOf(dbName) >= 0) {
                onError("Database " + dbName + " already exists !");
                return;
            }
            var createDbUri = source.uri + '_admin_db?action=create&db_name=' + dbName;
            $.when($.ajax(createDbUri)).then(onCreateDbSuccess, onCreateDbError);
        },
        error : onError});
        
};

// remove db. Use service if necessary
exports.drop_db = function(dbname, source, user, onSuccess, onError) {
    if (dbname === 'datamanager') {
        onError('Cannot delete datamanager db');
    }
    var db = $.couch.db(dbname);
   
    $.ajax({
            url : source.uri + '_admin_db?db_name=' + dbname + '&action=drop',
            dataType: 'json',
            success:  onSuccess,
            error : function(data) {   
            
                //try to do it without the service    
                db.drop({
                    success : onSuccess,
                    error : function() {
                        data = JSON.parse(data.response);
                        onError('Cannot drop db : ' + data.error);
                    }
                });                  
            }  
    });  
};

//var Query = require('vendor/datamanager/lib/query');
function _update_app (db, source, target, app_doc_id, onSuccess, onError) {

    function next () {
        $.couch.replicate(
            source, 
            target, 
            {
                success : function() {
                    db.viewCleanup({
                    success : function() {},
                        error : function () {}
                    });
                    // trigger indexing
                    //db.view('datamanager/alldocs');
                    //Query.triggerLuceneIndex(db);
                    onSuccess();
                },
                error : onError
            }, 
            {
                doc_ids:[app_doc_id]
            });
    }
    
    // try to purge data
    db.allDocs({
        key : app_doc_id,
        success : function (data) {
            if (!data.rows.length) {
                next();
            }
            else {
                var rev = data.rows[0].value.rev,
                purge_data = {};
                purge_data[app_doc_id] = [rev];

                $.ajax({
                    url: db.uri + '_purge',
                    timeout: 10000,
                    dataType: 'json',
                    data: JSON.stringify(purge_data),
                    contentType: 'application/json',
                    type: 'POST',
                    success: next,
                    error : onError
                });
            }
        },
        error : onError
    });
    

}


// Update app
// By default use local datamanager db
// or set in config 
// [datamanager]
// main_db = dbname
exports.update_app = function(db, onSuccess, onError) {
    var source =  'datamanager',
        target = db.name,
        app_doc_id = '_design/datamanager';

    $.couch.config({
            success: function(data) {
                //if (data) { source = data;  }
                _update_app(db, source, target, app_doc_id, onSuccess, onError);
            },
            error : function () {
                _update_app(db, source, target, app_doc_id, onSuccess, onError);
            }
        }, 
        'datamanager', 
        'main_db');
};

exports.update_all_app = function(onSuccess, onError) {
    var cpt = 0;
    function end() {
        cpt --;
        if (cpt <=0) {
            onSuccess();
        }
    }

    function updb(dbname, next) {
        if (dbname == 'datamanager' || dbname[0] == '_') {
            next();
        } else {
            var db = $.couch.db(dbname);
            db.openDoc(
                '_design/datamanager', 
                {
                    success : function(ddoc) {
                        exports.update_app(db, next, next);
                        //exports.compact_db(db, ddoc);
                    }, 
                    error : next
                });
        }
    }
    
    $.couch.allDbs({
        success : function(dbs) {
            cpt = dbs.length + 1;
            for (var i =0; i < dbs.length; i++) {
                updb(dbs[i], end);
            }
            end();
        }, 
        error : onError
    });
};

exports.compact_db = function(db, ddoc, onSuccess, onError) {
    for (var viewname in ddoc.views) {
        db.compactView('datamanager/' + viewname, {});
    }
    db.compact({ success : onSuccess });
};

exports.count_docs = function(db, params) {

    db.allDocs({
        startkey: '_design/mm_',
        endkey: 'mm_\ufff0',
        limit: 0,
        success: function(data) {
            params.success(data.total_rows - data.offset);
            //params.success(data.rows.length);
        },
        error : function (err) {
            if (params.error) {
                params.error(err);
            }
        }
    });
}

exports.get_db_links = function(db, cb, err) {

    db.openDoc('_local/dblinks', {
        success : function(doc) {
            cb(doc);
        },
        error : function () {
            var newDoc = {
                _id: '_local/dblinks',
                dbs: []
            };
            db.saveDoc(newDoc, {
                success: function(data) {
                    newDoc._rev = data.rev;
                    cb(newDoc);
                },
                error: function(e) {
                    if (err) {
                        err(e);
                    }
                }
            });
        }
    });
}

exports.bruteForceDelete = function(db, docid, cb, err) {
    db.openDoc(docid, {
        success : function(doc) {
            //$.log('BFD: open doc réussi', doc);
            db.removeDoc(doc, {
                success : function(data) {
                    exports.bruteForceDelete(db, docid, cb, err);
                },
                error : err
                });
        },
        error : cb
    });
}