// provide lock function to avoid concurrency on complex function


// creates a lock of a duration of maxtime
// call cb(true) if successfully acquired, cb(false) otherwise
exports.lock = function (db, name, maxduration_sec, cb) {
    var docid = "_local/lock_" + name,
    now = Date.now() / 1000;
    unlock_time = now + maxduration_sec,
    lock_doc = {
        _id: docid,
        unlock_time: unlock_time
    };

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

/**
 * calls cb(false) if already locked, cb(true) otherwise
 */
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

/**
 * calls cb(true) if successfully unlocked, cb(false) otherwise
 */
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


/**
 * protects a function
 * calls cb({ status: "error", reason: error description}) if already locked
 * calls function f otherwise, f will have a cb parameter
 */
exports.protect = function (db, name, maxduration_sec, f, cb, nbtry) {

    if (nbtry && (typeof(nbtry) != 'number' || nbtry < 0)) {
        nbtry = 0;
    }

    exports.lock(db, name, maxduration_sec, function (ok) {
        if (!ok) {

            if(!nbtry || nbtry < 1) {
                cb ({
                    status : 'error',
                    reason : '"' + name + '" already locked'
                });
                return;
            } else {
                // retry in 5 sec
                setTimeout(function () {
                    exports.protect(db, name, maxduration_sec, f, cb, nbtry - 1);
                    
                }, 5000);
            }
        }
  
        f(function () {
            var args = arguments;
            exports.unlock(db, name, function () {
                cb.apply(this, args);
            });
        });
    });
};