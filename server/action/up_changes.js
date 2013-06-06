/// get last changes and upate ref data

var RefUp = require('refup'),
    Lock = require('lock'),
    Uid = require('uid'),
    Label = require('label'),
    common = require('commons');

function _get_last_change_index(db, cb) {
    db.getDoc("_local/changes", function (err, data) {
        if (err) {
            data = {
                _id : "_local/changes",
                last_seq : 1
            };
        }
        cb(data);
    });
}

function get_changed_ids(db, cb) {
    _get_last_change_index(db, function (change_doc) {
        //log('updating changes from last changed index: ' + change_doc.last_seq);
        var ids = [],
            deleted_ids = [],
            start = change_doc.last_seq;
        db.changes({since:change_doc.last_seq}, function (err, data) {
            if (err) {
                q.send_error('error in get_changed_ids: ' + err);
            } else {
                //log('processing ' + data.results.length + ' changes');
                for (var r = 0, l = data.results.length; r < l; r++) {
                    var row = data.results[r];
                    if(row.deleted) { 
                        deleted_ids.push(row.id);
                    }
                    else if(row.id.slice(0, 8) != "_design/") { 
                        ids.push(row.id); 
                    }
                    change_doc.last_seq = Math.max(change_doc.last_seq, row.seq);
                }
                ids = common.unique(ids);
            }

            db.saveDoc(change_doc);
            cb(ids, deleted_ids, start, change_doc.last_seq);
        });
    });
}


function up_changes(db, ids, deleted_ids, cb) {

    var cpt = 0;

    function next() {
        cpt--;
        if (cpt == 0) {
            log('updating refs for deleted ids');
            RefUp.update_ref(db, deleted_ids, function () {
                log('all ref updates have returned');
                cb();
            });
        }
    }

    //log('calling up_changes on ' + ids.length + ' ids');
    if(ids.length == 0) {
        cb();
    }
    while (ids.length > 0) {
        cpt += 2;
        var subids = ids;
        ids = subids.splice(1000); // process by 1000 docs
        // subids contains only 1000 docs
        db.allDocs({
                keys:subids,
                include_docs:true
            }, function (err, data) {
                data = data || {
                    rows : []
                };
                var docs = data.rows.map(function (e) {
                    return e.doc;
                });
                RefUp.update_docs(db, docs, function (docs, doc_to_save) {
                    //log('calling bulk save on ' + doc_to_save.length + ' docs');
                    db.bulkDocs({docs:doc_to_save}, function () {
                        log('calling update_ref on ' + subids.length + ' ids');
                        RefUp.update_ref(db, subids, function () {
                            next();
                        });
                        // update sons labels
                        update_all_sons_labels(db, subids, function() {
                            next();
                        });
                    });
                });
            }
        );
    }
}

// for all given ids, update labels of all sons
function update_all_sons_labels(db, ids, cb) {

    var tasks = ids.length,
        docsToSave = [];

    Label.update_labels(db, ids, function(err, sonsToSave) {
        db.bulkDocs({
            docs: docsToSave
        }, function(err, data) {
            cb();
        });
    });
}

// launches the whole process, and unlocks at the end
function process(db, unlockCb) {
    get_changed_ids(db, function (ids, deleted_ids, start, end) {
        up_changes(db, ids, deleted_ids, function () {
            log('up_changes complete - unlocking');
            unlockCb();
        });
    });
}

// prevents process() from running twice at the same time
function main(db) {
    log('trying to acquire lock for up_changes');

    Lock.protect(db, "update_mm", 10 * 60, function (unLockCb) { // 10 minutes
            process(db, function (err, data) {
                 Uid.update_ids(db, unLockCb);
            });           
        }, function(err, data) { // after releasing lock
            if (err) {
                q.send_error({ status: "locked" });
            } else {
                q.send_json({ status: "up_changes finished" });
            }      
        });    
}

main(q.db);