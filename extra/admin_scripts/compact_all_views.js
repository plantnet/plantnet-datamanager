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

        db.request({
            path:"_compact/" + mm._id,
            method:"POST"
        }, function(a,b,c) {console.log(a,b,c);});

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
            update_views(db);
        }) ;
    });
    
}



main();