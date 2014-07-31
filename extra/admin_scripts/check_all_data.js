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

var dm = function (client, db_name, ddoc_action, params, data, cb) {

    path = "/_dm/" + db_name + "/" + ddoc_action;
    cb = cb || function () {};

    if(data) {
        client.request({
            method:"POST",
            data:data,
            path:path,
            query:params
        }, cb);
    }
    else {
        console.log(path, params);
        client.request({
            method:"GET",
            path:path,
            query:params
        }, cb);
    }
    

}

function check_data_mm(client, db, mm_id) {
    console.log("checking " + db.name + " " + mm_id);
    dm(client, db.name, "datamanager/check_mm", {mm:mm_id}, null, function () {
        dm(client, db.name, "datamanager/update_mm", {mm:mm_id}, null, function () {
            console.log("checked " + db.name + " " + mm_id);
        });
    });
    
    
}

function check_data(client, db) {
    
    db.allDocs({
        startkey : "_design/mm",
	endkey : "_design/mm\ufff0"
    }, function (err, r) {
        r.rows.forEach(function (e) {
            check_data_mm(client, db, e.id);
        });
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
            check_data(client, db);
        });
    });
    
}



main();