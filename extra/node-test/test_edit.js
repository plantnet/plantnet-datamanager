var dm = require("./dm");

var gen_data;

module.exports = {
    
    deleteDB: function (test) {
        test.expect(1);
        dm.couchDb("test_db").remove(function (err, data)  {
            dm.couchDb("test_db").info(function (err, data) {
                test.ok(err),
                test.done();
            });
        });
    },

    createDB: function (test) {
        test.expect(1);
        dm.couchClient().replicate("datamanager", "test_db", 
                                   {create_target:true, doc_ids : ["_design/datamanager"]}, 
                                   function() {
                                       dm.couchDb("test_db").info(function (err, data) {
                                           test.ok(data),
                                           test.done();
                                       });
                                   });

    },

    generateData : function (test) {
        test.expect(1);

        dm.dm("test_db", "datamanager/generate_test_data", 
              {}, null, function (err, data) {
                  gen_data = data;
                  dm.couchDb("test_db").getDoc(gen_data.mm_ref_id, function (err, mm) {
                      test.ok(mm.name);
                      test.done();
                  });
                  
              });
    },

    bulkEdit : function (test) {
        test.expect(1);
        dm.dm("test_db", "datamanager/bulk_edit", {
            mm:gen_data.mm_obs_id
        }, null, function (err, data) {

        }); 
        
    }
             
};
