/*
Update all views

need a config.ini
login=
password=
host=
port=


*/


var couchdb = require('plantnet-node-couchdb');
var iniparser = require('iniparser');
var http = require('http'); 

var config, client, url;

function call_views(db, ddocs) {
    ddocs = ddocs.rows;
    
    console.log(db.name + ": indexing " + ddocs.length + " ddocs");

    for (var i = 0; i < ddocs.length; i++) {
        var name = ddocs[i].doc._id.split("/")[1];
        var mm = ddocs[i].doc;

        for (var v in mm.views) {
            db.view(name, v, {limit:1, reduce:false},
                    function (err, r) {
                        
                    });
            break; // call only first views
        }

        // call spatial functions
        for (var v in mm.spatial) {
            console.log(db.name + ": indexing spatial func");
            http.get({
                host: config.host,
                port : config.port, 
                auth : config.login + ":" + config.password,
                path: "/" + db.name + "/" + mm._id  + "/_spatial/"  + v
            }, function (a) { 
            }).on('error', function(e) { console.log(e.message);});
            break; // call only first views
        }

    }
};

function update_views(db) {
    db.allDocs({
                   startkey : "_design/",
		   endkey : "_design/\ufff0",
		   include_docs : true,
                   cache : JSON.stringify(new Date().getTime())
               }, function (err, r) {
                   call_views(db, r);
               });

    // call lucene
    console.log(db.name + " : lucene indexation");
    http.get({
        host: config.host,
        port : config.port, 
        auth : config.login + ":" + config.password,
        path: "/_fti/local/" + db.name + "/_design/datamanager/everyfield?q=a&stale=ok&limit=1"
    }, function (a) { 
    }).on('error', function(e) { console.log(e.message);});

    
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
        dbs.forEach(function (e) {
            var db = client.db(e);
            db.viewCleanup();
            update_views(db);
        }) ;
    });
    
}



main();