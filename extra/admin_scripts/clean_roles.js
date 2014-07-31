// remove role for deleted db

var couchdb = require('plantnet-node-couchdb');
var iniparser = require('iniparser');
var http = require('http');
var config, client;


function clean_roles (dbs) {
    var userDb = client.db('_users'),
    to_save = [];
    

    
    // get all user docs
    userDb.allDocs(
        {
            include_docs: true
        }, 
        function (err, data) {
            if (err) {
                error(err);
            } else {

                data.rows.forEach(
                    function (e) {
                        if(!e.doc.roles) {
                            return;
                        } else {
                            e.doc.roles = 
                                e.doc.roles.filter(function (r) {
                                                       r = r.split(".");

                                                       if(r.length === 1) { 
                                                           // not a db -> other role
                                                           return true;
                                                       }
                                                       r = r[0]; // dbname
                                                       // if db doesn't exists
                                                       var exist = dbs.indexOf(r) >= 0;
                                                       if(!exist) {
                                                           console.log(r);
                                                       }
                                                       return exist;
                                                   });
                            to_save.push(e.doc);
                        }
                    });
                
                // userDb.bulkDocs(
                //      {docs : to_save}, 
                //     function (err, data) {
                
                //          console.log("okok");
                //     });

            }});

}

function main () {

    http.globalAgent.maxSockets = 30;

    // get config
    config = iniparser.parseSync(__dirname + '/config.ini');
    client = couchdb.createClient(config.port, config.host, 
                                  config.login, config.password);
    
    client.allDbs(function(err, dbs) {
                      clean_roles(dbs);

                  });

}

main();                               


