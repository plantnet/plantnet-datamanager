var dm = require("./dm");

var dburl = "http://admin:poulpy@localhost:5984/test_db_adv";

module.exports = {

    /*"deleteDB": function (test) {
        test.expect(1);
        dm.couchDb(dburl).remove(function (err, data) {
            dm.couchDb(dburl).info(function (err, data) {
                test.ok(err),
                test.done();
            });
        });
    },

    "syncFromAdventilles": function (test) {
        test.expect(1);
        dm.couchClient().replicate("http://mchouet:poulpy@data.plantnet-project.org/adventilles", dburl, {
                create_target:true,
                //doc_ids : ["_design/datamanager"]
            }, function() {
                dm.couchDb(dburl).info(function (err, data) {
                    test.ok(data),
                    test.done();
                });
            }
        );
    },*/

    "updateTo08": function(test) {
        test.expect(1);
        dm.couchClient().replicate("http://admin:poulpy@localhost:5984/datamanager", dburl, {
                doc_ids : ["_design/datamanager"]
            }, function(data) {
                test.ok(data);
                test.done();
            }
        );
    },

    "check_data": function (test) {
        test.expect(3);
        var cpt = 2;
        dm.dm(dburl, "check_data", null, null, function (err, data) {
            console.log(err, data);
            test.ok(! err);
            dm.dm(dburl, "update_views", null, null, function (err, data) {
                console.log(err, data);
                test.ok(! err);
                cpt--;
                next();
            });
            dm.dm(dburl, "up_changes", null, null, function (err, data) {
                console.log(err, data);
                test.ok(! err);
                cpt--;
                next();
            });
        });

        function next() {
            if (cpt == 0) {
                test.done();
            }
        }
    },

    "update_mm_taxinomie" : function (test) {
        test.expect(1);
        var mm_ref_id = "_design/mm_fa29506c-0cd9-40c0-915e-6ba4949b4211";
        console.log(mm_ref_id);
        dm.dm(dburl, "update_mm", {
                mm : mm_ref_id
            }, null, function (err, data) {
                console.log(err, data);
                test.ok(data.status == 'ok');
                /*dm.dm("test_db", "update_mm", {mm : gen_data.mm_ref_id}, null, function (err, data) {
                    console.log(err, data);
                    test.ok(data.status == 'ok');
                    test.done();
                });*/
                test.done();
            }
        );
    }
};
