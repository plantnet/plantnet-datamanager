// remove user without any role

var couchdb = require('plantnet-node-couchdb');
var iniparser = require('iniparser');
var http = require('http');
var config, client;


function clean_users () {
    var userDb = client.db('_users'),
    to_delete = [];
    

    
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
                        } else
                        if (e.doc.roles.length === 0) {
                            to_delete.push({
                                _id : e.doc._id,
                                _rev : e.doc._rev,
                                _deleted : true
                            });
                        }
                    });
                
                console.log(to_delete);
                
                userDb.bulkDocs(
                    {docs : to_delete}, 
                    function () {
                        console.log("okok");
                    });


            }});

}

function main () {

    http.globalAgent.maxSockets = 30;

    // get config
    config = iniparser.parseSync(__dirname + '/config.ini');
    client = couchdb.createClient(config.port, config.host, 
                                  config.login, config.password);

    clean_users();
}

main();                               


