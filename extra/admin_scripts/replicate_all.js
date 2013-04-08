// replicate all db


var couchdb = require('./node-couchdb');
var iniparser = require('./node-iniparser');
var http = require('http');
var config, client, target_client, source_url, target_url;


function replicate(db_name, cb) {

    var db = client.db(db_name);
    var target_db = target_client.db(db_name); 
    
    console.log("start replicate " + db_name);
    target_client.replicate(source_url + "/" + db_name, target_url + "/" + db_name, {
                     create_target : true}
                     , 
                     function() {
                         console.log("end replicate " + db_name);
                         db.getDoc("_security", function(err, data) {
                                       console.log(err, data);
                                       target_db.saveDoc("_security", data);
                                   });

                         db.getDoc("_local/wiki", function(err, wiki) {
                                       if(!wiki) {
                                           return;
                                       } else {
                                           console.log(wiki);
                                       }
                                       target_db.getDoc("_local/wiki", function(err, wiki2) {
                                                             if(err || ! wiki2) {
                                                                 wiki2 = {
                                                                     _id : "_local/wiki"
                                                                 };
                                                             }
                                                             wiki2.desc = wiki.desc;
                                                             wiki2.comments = wiki.comments;
                                                             target_db.saveDoc(wiki2, function (err, data) {
                                                                                   console.log(err, data);
                                                                               });
                                                             
                                                         });
                                   });


                         

                         update_views(target_db);
                     }
                    );

}

function call_views(db, ddocs) {
    ddocs = ddocs.rows;
    for (var i = 0; i < ddocs.length; i++) {
        var name = ddocs[i].doc._id.split("/")[1];
        for (var v in ddocs[i].doc.views) {
            db.view(name, v, {limit:1, reduce:false},
                    function (err, r) {
                        
                    });
            break; // call only first views
        }
    }
    console.log("start indexing " + ddocs.length + " ddocs");


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
    config = iniparser.parseSync(__dirname + '/config.ini');
    client = couchdb.createClient(config.port, config.host, 
                                  config.login, config.password);

    target_client = couchdb.createClient(config.target_port, config.target_host, 
                                  config.target_login, config.target_password);

    source_url = "http://" + config.login + ":" + config.password +
        "@" + config.host + ":" + config.port;

    target_url = "http://" + config.target_login + ":" + config.target_password +
        "@" + config.target_host + ":" + config.target_port;

    client.allDbs(function(err, dbs) {
                      dbs.push("_users");
                      dbs.forEach(function (e) {
                                      replicate(e);
                                  }) ;
                  });
    
}

main();                               




