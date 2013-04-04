/*

*/

var couchdb = require('./node-couchdb'),
iniparser = require('./node-iniparser'),
url = require('url');

var client, user_roles = {};

process.on('uncaughtException', function(err, data) {
               console.log({'error' : err.stack || err.message});
               process.exit(1);

});

// set role for user (previous one for a db is removed)
function setRole(user, db, role) {
    user_roles[user] = user_roles[user] || {};
    user_roles[user][db] = role;
}

// return a list of role without duplicate
function getRoles(user) {
    var r = user_roles[user], ret = [];
    for (var db in r) {
        ret.push(db + "." + r[db]);
    }
    return ret;
}

function setDbSecurity(dbname, cb) {
    
    var rigths = {
        admins: {
            names: [],
            roles: [dbname + '.admin']
        },
        members: {
            names: [],
            roles: [dbname + '.writer', dbname + '.reader']
        }};

    var db = client.db(dbname);
    db.saveDoc('_security', rigths, cb);
}



function readDbSecurity(dbname, cb) {
    var db = client.db(dbname);
    db.getDoc('_security', function (err, data) {
                  if(data) {
                      
                      data.members = data.members || data.readers;
                      
                      if(data.members) {
                          for (var i = 0; i < data.members.names.length; i++) {
                              var user = data.members.names[i];
                              setRole(user, dbname, "writer");
                          }
                      }

                      // admin a stronger than writer
                      if(data.admins) {
                          for (var i = 0; i < data.admins.names.length; i++) {
                              var user = data.admins.names[i];
                              setRole(user, dbname, "admin");
                          }
                      }
                  }
                  cb();
              });
}
    


function saveUserRoles() {
    var userdb = client.db('_users');
    var users = [];
    for (var u in user_roles) {
        users.push('org.couchdb.user:' + u);
    }
    console.log(users);
    userdb.allDocs({
                       keys: JSON.stringify(users),
                       include_docs: true
                   },
                   function(err, data) {
                       if(data) {
                           
                           var newDocs = data.rows.map(function (e) {
                                                           if(!e.doc) { return null; }
                                                           e.doc.roles = e.doc.roles.concat(getRoles(e.doc.name));
                                                           return e.doc;
                                                       });
                           newDocs = newDocs.filter(function (e) { return !!e; });
                           userdb.bulkDocs(
                               {docs : newDocs}, 
                               function (err, data) {
                                   console.log(err, data);
                               });
                       }}
                  );
}


function migrate(dbname, cb) {
    
    readDbSecurity(dbname, function() {
                       setDbSecurity(dbname, cb);
                   });
    
}

var cpt = 1;
function next() {
    cpt--;
    console.log(cpt);
    if (cpt <= 0) {
        console.log(user_roles);
        saveUserRoles();
    }
}


function main () {
    // get config
    var config = iniparser.parseSync(__dirname + '/admin_db.ini');
    client = couchdb.createClient(config.port, config.host, config.login, config.password);
    
    client.allDbs(function(err, dbs) {
                      dbs.forEach(function (e) {
                                      if(e.slice(0,1) === '_') {
                                          return;
                                      }
                                      cpt ++;
                                      console.log(e);
                                      migrate(e, function () { next(); });
                                  });
                      next();
                  });
}

main();                               
