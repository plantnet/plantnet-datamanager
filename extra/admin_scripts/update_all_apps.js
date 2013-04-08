var couchdb = require('plantnet-node-couchdb');
var iniparser = require('iniparser');
var http = require('http'); 

var config, client, url;


function update_app(db_name) {
    client.replicate("datamanager", db_name,
         {
             doc_ids:["_design/datamanager"]
         });
}



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


    
    client.allDbs(function(err, dbs) {
        if(err) {
            console.log(err);
            return;
        }
        dbs.filter(function (e) {
            return e.slice(0, 1) !== "_";
        }).forEach(function (e) {
            console.log("update app : " + e)
            var db = client.db(e);
            db.viewCleanup();
            update_app(e);
        }) ;
    });
    
}



main();