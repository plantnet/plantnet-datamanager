// provide lock function to avoid concurrency on complex function


// create a lock of a duration of maxtime
// call cb(true) if sucess
exports.lock = function (db, name, maxduration_sec, cb) {
    var docid = "_local/lock_" + name,
    now = Date.now() / 1000;
    unlock_time = now + maxduration_sec,
    lock_doc = {_id:docid, unlock_time:unlock_time};
    
    db.getDoc(docid, function (err, data) {
        if (data) {
            if (data.unlock_time > now) {
                cb(false);
                return;
            } else {
               lock_doc._rev = data._rev;
            }
        }
        db.saveDoc(lock_doc, function(err, data) {
            cb(!err);
        });
    });  
};

// call cb(false) if already lock
exports.try_lock = function (db, name, cb) {
    var docid = "_local/lock_" + name,
    now = Date.now() / 1000;
   
    db.getDoc(docid, function (err, data) {
        if (data && data.unlock_time > now) {
            cb(false);
            return;
        }
        cb(true);
    });
};

exports.unlock = function (db, name, cb) {
    var docid = "_local/lock_" + name;
    db.getRev(docid, function (err, rev) {
        if (err) {
            cb(false); 
            return;
        }
        db.removeDoc(docid, rev, function() {
            cb(true);
        });
    });
};

// protect a function
// if fail, call cb(error);
// f is the function to call (the first arg is the cb to call);
exports.protect = function (db, name, maxduration_sec, f, cb) {

     exports.lock(db, name, maxduration_sec, function (ok) {
        if (!ok) {
            console.log('lock foirax');
            cb ({ status : 'error',
            reason : 'already locked'});
            return;
        }
        f(function () {
            var args = arguments;
             exports.unlock(db, name, function () {
                    cb.apply(this, args);
            });
        });
    });
};

/// / decorator to protect a function
// exports.protect = function (name, maxduration_sec, f, db_pos, cb_pos) {
//     
//     return function () {
//         var db = arguments[db_pos];
//         var cb = arguments[cb_pos];
//         
//         arguments[cb_pos] = function () {
//             var args = arguments;
//             exports.unlock(db, name, function () {
//                 cb.apply(this, args);
//             })
//         };
//         
//         exports.lock(db, name, maxduration_sec, function (ok) {
//             if (!ok) {
//                 cb ({ state : 'error',
//                 reason : 'already locked'});
//                 return;
//             }
//             f(arguments);
//         });
//     }
//     
// }
