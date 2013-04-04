var dm = require("./dm"),
    lock = require('./lock'),
    slp = require('sleep');

var test_db = 'test_db_lock';

function waitABit(callback) {
    slp.sleep(2);
    callback({ status: 'good' });
}

module.exports = {

    "deleteDb": function (test) {
        test.expect(1);
        dm.couchDb(test_db).remove(function (err, data)  {
            dm.couchDb(test_db).info(function (err, data) {
                test.ok(err),
                test.done();
            });
        });
    },

    "createDb": function (test) {
        test.expect(1);
        dm.couchClient().replicate("datamanager", test_db, {
            create_target: true,
            doc_ids : ["_design/datamanager"]
        }, function() {
            dm.couchDb(test_db).info(function (err, data) {
                test.ok(data),
                test.done();
            });
        });
    },

    "acquire": function(test) {
        test.expect(1);
        lock.lock(dm.couchDb(test_db), 'verrouA', 30, function(acquired) {
            test.ok(acquired);
            test.done();
        });
    },

    "tryLock": function(test) {
        test.expect(1);
        lock.try_lock(dm.couchDb(test_db), 'verrouA', function(available) {
            test.ok(! available);
            test.done();
        });
    },

    "reAcquire": function(test) {
        test.expect(1);
        lock.lock(dm.couchDb(test_db), 'verrouA', 30, function(acquired) {
            test.ok(! acquired);
            test.done();
        });
    },

    "reTryLock": function(test) {
        test.expect(1);
        lock.try_lock(dm.couchDb(test_db), 'verrouA', function(available) {
            test.ok(! available);
            test.done();
        });
    },

    "acquireOther": function(test) {
        test.expect(1);
        lock.lock(dm.couchDb(test_db), 'verrouB', 30, function(acquired) {
            test.ok(acquired);
            test.done();
        });
    },

    "release": function(test) {
        test.expect(1);
        lock.unlock(dm.couchDb(test_db), 'verrouA', function(released) {
            test.ok(released);
            test.done();
        });
    },

    "reReTryLock": function(test) {
        test.expect(1);
        lock.try_lock(dm.couchDb(test_db), 'verrouA', function(available) {
            test.ok(available);
            test.done();
        });
    },

    "reRelease": function(test) {
        test.expect(1);
        lock.unlock(dm.couchDb(test_db), 'verrouA', function(released) {
            test.ok(released);
            test.done();
        });
    },

    "reReReTryLock": function(test) {
        test.expect(1);
        lock.try_lock(dm.couchDb(test_db), 'verrouA', function(available) {
            test.ok(available);
            test.done();
        });
    },

    "releaseOther": function(test) {
        test.expect(1);
        lock.unlock(dm.couchDb(test_db), 'verrouB', function(released) {
            test.ok(released);
            test.done();
        });
    },

    "reReAcquire": function(test) {
        test.expect(1);
        lock.lock(dm.couchDb(test_db), 'verrouA', 30, function(acquired) {
            test.ok(acquired);
            test.done();
        });
    },

    "reAcquireOther": function(test) {
        test.expect(1);
        lock.lock(dm.couchDb(test_db), 'verrouB', 30, function(acquired) {
            test.ok(acquired);
            test.done();
        });
    },

    "reReReReTryLock": function(test) {
        test.expect(1);
        lock.try_lock(dm.couchDb(test_db), 'verrouA', function(available) {
            test.ok(! available);
            test.done();
        });
    },

    "protectTwice": function(test) {
        test.expect(2);
        var cpt = 2;
        function next() {
            if (cpt == 0) {
                test.done();
            }
        }
        lock.protect(dm.couchDb(test_db), "couscous", 30, waitABit, function(data) {
            console.log(data.status);
            test.ok(data.status == 'good');
            cpt--;
            next();
        });
        //slp.sleep(1);
        lock.protect(dm.couchDb(test_db), "couscous", 30, waitABit, function(data) {
            console.log(data.status);
            test.ok(data.status == 'error');
            cpt--;
            next();
         });
    },

    "reProtect": function(test) {
        test.expect(1);
        lock.protect(dm.couchDb(test_db), "couscous", 30, function (cb2) {
           waitABit(cb2);
        }, function(data) {
            test.ok(data.status == 'good');
            test.done();
        });
    }
};