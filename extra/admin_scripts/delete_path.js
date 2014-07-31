var couchdb = require('plantnet-node-couchdb');
var iniparser = require('iniparser');
var http = require('http'); 

var config, client, url;


function main () {

    http.globalAgent.maxSockets = 30;

    // get config
    try {
        config = iniparser.parseSync(__dirname + '/config.ini');
        url = "http://" + config.login + ":" +  config.password + "@"
            + config.host + ":" + config.port;

        client = couchdb.createClient(config.port, config.host, 
                                      config.login, config.password);
        
        
    } catch (x) {
        console.log("please ensure you have a config.ini with db info");
        console.log("login=user");
        console.log("password=pwd");
        console.log("host=data.plantnet-project.org");
        console.log("port=80");
        return;

    }

    var db = client.db("tree_laos_test");
    
    db.allDocs({startkey:"mm_529a97ad159b72638ecbac737e01e651", 
                endkey:"mm_529a97ad159b72638ecbac737e01e651" + "\ufff0", 
                include_docs:true},
              function (err, data) {
                  
                  var docs = data.rows.map(function (e) {
                                               var doc = e.doc;
                                               delete doc.$path;
                                               //console.log(doc._id, doc.$path);
                                               return doc;
                                           });

                  console.log(docs);
                  db.bulkDocs({docs:docs, "all_or_nothing":true}, function (err, data) {
                                  console.log(err, data);
                              });


              });
    
}



main();