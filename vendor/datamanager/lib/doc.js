var utils = require("vendor/datamanager/lib/utils"),
    cacheLib = require("vendor/datamanager/lib/cache");

// add an url attachment
exports.add_url_attachment = function (db, _id, url, onSuccess, onError) {

    db.openDoc(_id, {
        success : function(doc) {
            var a = doc.$attachments;
            if(!a) {
                a = {};
                doc.$attachments = a;
            }
            a[url] = {
                url : url
            };

            db.dm("datamanager/save_doc", {}, doc, onSuccess, onError);
        }
    });
};

// remove an attachment (url or embedded)
exports.delete_attachment = function (db, _id, _rev, key, embedded, onSuccess, onError) {

    if(embedded) {
        var url = db.uri + $.couch.encodeDocId(_id) + "/" + key;
        $.ajax({ type : "DELETE",
	         url : url + "?rev=" + _rev,
	         success : onSuccess,
                 error : onError
	       });
    } else {
        db.openDoc(_id, {
            success : function(doc) {
                var a = doc.$attachments;
                if(a && a[key]) { 
                    var e = a[key];
                    delete a[key]; 
                }
                db.dm("datamanager/save_doc", {}, doc, onSuccess, onError);
            }
        });
    }
};


// delete
exports.delete_with_sons = function (db, ids, onSuccess, onError, deleteSynonyms) {
    var c = JSON.stringify(new Date().getTime());
    db.view("datamanager/sons", {
        keys : ids,
        success : function(sons_data) {
            
            // get ids
            var delete_ids = sons_data.rows.map(function (row) {return row.id;});
            delete_ids = delete_ids.concat(ids).unique();

            // check if there are synonyms
            db.view("datamanager/synonym", {
                reduce : false,
                cache : c,
                keys : delete_ids,
                success : function (res) {

                    var validate_ids=[];

                    var delete_ids_map = {};
                    delete_ids.forEach(function (e) {
                        delete_ids_map[e] = true;
                    });
                    for (var ires = 0; ires < res.rows.length; ires++) {
                        if (! delete_ids_map[res.rows[ires].id]) {
                            validate_ids.push(res.rows[ires].id);
                            if (deleteSynonyms) {
                                delete_ids.push(res.rows[ires].id);
                            }
                        }
                    }

                    if (deleteSynonyms && validate_ids.length > 0) {
                        // recursive call to get sons for new synonyms
                        delete_ids = delete_ids.concat(validate_ids).unique();
                        exports.delete_with_sons(db, delete_ids, onSuccess, onError, deleteSynonyms);
                    } else {
                        // if there were no new synonyms, delete all pushed docs

                        // get docs (delete)
                        db.allDocs( {
                            keys : delete_ids,
                            cache : c,
                            success : function (docs) {
                                docs = docs.rows.map(function (row) {
                                         return {
                                             _id : row.id,
                                             _rev : row.value.rev
                                         };
                                     });
                                if (!docs.length) { onError ("No doc to delete");}
                                db.bulkRemove({docs : docs, "all_or_nothing" : true } , {
                                    success : function() {
                                        // get all docs (update synonyms)
                                        db.allDocs( {
                                            keys : validate_ids,
                                            cache : c,
                                            include_docs : true,
                                            success : function (documents) {
                                                var docs_to_save = [];
                                                for (var i = 0; i < documents.rows.length; i++) {
                                                    delete documents.rows[i].doc.$synonym;
                                                    docs_to_save.push(documents.rows[i].doc);
                                                }
    
                                                if (docs_to_save.length > 0) {
                                                    db.bulkSave({docs: docs_to_save}, {
                                                        success: function() {
                                                            var plurs = ' has';
                                                            if (docs_to_save.length > 1) {
                                                                plurs = 's have';
                                                            }
                                                            utils.showWarning(docs_to_save.length + ' synonym' + plurs + ' been unlinked.');
                                                            onSuccess (delete_ids.length);
                                                        },
                                                        error: function() {
                                                            onError ('Documents deleted but error while updating synonyms.');
                                                        }
                                                    });
                                                } else {
                                                    onSuccess (delete_ids.length);
                                                }
                                            }
                                        });
                                    },
                                    error : function (e_id, str, details) {
                                      onError("Error : " + details);
                                    }
                                });
                            }
                        });
                    }
                }
            });
        }
    });
};



// format doc in html
// is useStructureInfo is set to true, only fields declared in the structure will be shown,
// otherwise all fields in the doc
exports.to_html = function (doc, useStructureInfo, app) {

    var ret ='<p class="map-point">';

    function iterate() {
        for (var key in doc) {
            if (key[0] === '$' || key[0] === '_') {
                continue;
            }
            ret += '<label>' + key + '</label> : ' + doc[key] + '<br/>';
        }
    }

    if (useStructureInfo === true) {
        var mm = cacheLib.get_cached_mm(app, doc.$mm);
        if (mm) {
            var fields = mm.modules[doc.$modt].fields;
            for (var i = 0, l = fields.length; i < l; i++) {
                if(doc[fields[i].name]) {
                    ret += '<label>' + fields[i].name + '</label> : ' + doc[fields[i].name] + '<br/>';
                }
            }
        } else {
            iterate();
        }
    } else {
        iterate();
    }

    ret += "</p>";
    ret += '<a href="#/viewdoc/' + doc._id + '">Show data</a>';
    return ret;
};

// set synonym active_id for syn_ids
exports.set_active_synonym = function (db, active_id, syn_ids, onSuccess, onError) {

    db.allDocs({
       keys : [active_id].concat(syn_ids),
       cache : JSON.stringify(new Date().getTime()),
       include_docs : true,
       success : function (docs) {
           docs = docs.rows.map(function (e) {
                var d = e.doc;
                if (d._id == active_id) {
                    delete d.$synonym;
                } else {
                    d.$synonym = active_id;
                }
                return d;
            });
           delete(docs[0].$synonym);
           db.bulkSave({docs:docs, "all_or_nothing" : true}, {
               success : onSuccess,
               error : onError
           });
       },
       error: onError
   });
};

// call callback(rev)
exports.get_rev = function(db, doc_id, callback) {

    $.ajax({
        type : "HEAD",
        url : db.uri + $.couch.encodeDocId(doc_id),
        complete :  function (XMLHttpRequest, textStatus) {
            var headers = XMLHttpRequest.getAllResponseHeaders();
            if(!headers) {
                callback();
            }

            headers = headers.split("\n");

            var new_headers = {};
            for (var key = 0, l = headers.length; key < l; key++) {
                if (headers[key].length != 0) {
                    var header = headers[key].split(": ");
                    new_headers[header[0]] = decodeURIComponent(header[1]);
                }
            }
            var r = new_headers["Etag"];
            callback(r ? r.slice(1, r.length - 1) : undefined);
        },
        error : function() {}
    });
};


