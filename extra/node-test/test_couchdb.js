
var dm = require("./dm");

module.exports = {
    'true' : function (test) {
        test.expect(1);
        test.ok(true, "fail");
        test.done();
    }, 
    'stats' : function (test) {
        test.expect(2);
        var stats =  dm.couchClient().stats(function (err, data) {
            test.ok(!err);
            test.ok(data),
            test.done();
        });
    },
    'info' : function (test) {
        test.expect(1);
        dm.couchDb("datamanager").info(function (err, data) {
            test.equal(data.db_name, "datamanager"),
            test.done();
        });
    }
};
