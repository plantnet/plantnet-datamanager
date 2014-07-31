var couchdb = require('plantnet-node-couchdb');
var iniparser = require('iniparser');


// asyncForEach
// fn : a function (elem, next_func)
// callback : final callback
Array.prototype.asyncForEach = function (fn, callback) {
  var array = this.slice(0);
  function processOne() {
    var item = array.pop();
    fn(item, function(result) {
        if(array.length > 0) {
          setTimeout(processOne, 0); // schedule immediately
        } else {
          callback(); // Done!
        }
      });
  }
  if(array.length > 0) {
    setTimeout(processOne, 0); // schedule immediately
  } else {
    callback(); // Done!
  }
};



function copy_all_data(source_db, dest_db) {

    var dest_ids = {};
    dest_db.allDocs({}, function(err, data) {
        data.rows.forEach(function(e) { dest_ids[e.id] = true;  } );

    source_db.allDocs({}, function(err, data) {
        if(err) {
            console.log(err);
            return;
        }

        //console.log(data);

        data.rows.asyncForEach(function (e, next) {

            if(dest_ids[e.id]) { next(); return; }

            var id = e.key;
            if(id.slice(0, 8) !== "_design/") {
                id = encodeURIComponent(e.key)
            }
            
            source_db.getDoc(id, null, true, function(err, data) {
                if(err) {
                    console.log(e, err);
                    next();
                    return;
                }
                
                console.log(data);
                if (data._attachments) {
                    console.log(data._attachments); 
                }
                next(); 

                var doc = data;
                delete doc._rev;
                //console.log(doc._id);

                // dest_db.saveDoc(id, doc, function(err, data) {
                //     if(err) {
                //         console.log("cannot write", err, doc._id, doc._rev);
                //     } else {
                //         console.log("write " + doc._id);
                //     }
                //     next();
                // });
            })

        }, function() { console.log("end"); });
    });
    });

}


function main () {
    // get config
    config = iniparser.parseSync(__dirname + '/config.ini');
    client = couchdb.createClient(config.port, config.host, 
                                  config.login, config.password);

    console.log("copy from " + process.argv[2] + " to " + process.argv[3]);
    var source_db = client.db(process.argv[2]);
    var dest_db = client.db(process.argv[3]);

    dest_db.create(function () {
        copy_all_data(source_db, dest_db);
    });
    
}

main();                               




