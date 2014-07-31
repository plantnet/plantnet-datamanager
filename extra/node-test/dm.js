// utility lib to call datamanager functions via couchdb

var http = require('http'); 
var iniparser = require('iniparser');
var couchdb = require("plantnet-node-couchdb");

exports.couchClient = function () {
    var config;
    try { 
        config = iniparser.parseSync(__dirname + '/config.ini');
    } catch (Exception) {
        config = {
            host : "localhost",
            port : 5984
        };
    }

    return couchdb.createClient(config.port, config.host, 
                                config.login, config.password);
}

exports.couchDb = function (db_name) {
    return exports.couchClient().db(db_name);
}

exports.dm = function (db_name, ddoc_action, params, data, cb) {

    var config, reqopt = {}, ddoc = ddoc_action;
    try { 
        config = iniparser.parseSync(__dirname + '/config.ini');
    } catch (Exception) {
        config = {
            host : "localhost",
            port : 5984
        };
    }

    reqopt.host = config.host;
    reqopt.port = config.port;
    if(config.login) {
        reqopt.auth = config.login + ":" + config.password;
    }

    reqopt.path = '/_dm/' + db_name +  "/" + ddoc;
    reqopt.method = data ? "POST" : "GET";

    if(params) {
        var p = [];
        for(var k in params) {
            p.push(encodeURIComponent(k) + "=" + encodeURIComponent(params[k]));
        }
        if(p.length) {
            reqopt.path += "?" + p.join("&");
        }
    }
    var req = http.request(reqopt, function (res) {
        var resdata = '';
        res.on('data', function (chunk) {
            resdata += chunk;
        });
        res.on('end', function () {
            res.data = resdata;
           
            try {
                res.data = JSON.parse(res.data);
            } catch (Exception) {
                console.log(Exception);
            }

            if (res.statusCode == 200) { cb (null, res.data); }
            else { cb(res.data); }
            
            
        });
    });
    req.on('error', function(e) { 
        cb(e, null);
    });

    if(data) {
        req.write(data);
    }
    req.end();
}