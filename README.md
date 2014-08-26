Pl@ntnet-DataManager
====================

Copyright  ©  INRA/INRIA/CIRAD/IRD/Tela Botanica - 2011-2014

Authors:
     samuel dufour-kowalski <samuel.dufour@cirad.fr>
     mathias chouet <mathias.chouet@inria.fr>
     jean-pascal milcent <jpm@tela-botanica.org>
     benjamin liens <benjamin.liens@cirad.fr>, 
     gregoire duche <gregoire@tela-botanica.org>
     pierre bonnet <pierre.bonnet@cirad.fr>
     antoine.affouard <antoine.affouard@cirad.fr>

 
Short Description
=================

Distributed and modular data management software based on CouchDB.

Licenses
========

Pl@ntnet-Datamanager is distributed under a Cecill V2 license (see license.md)

This software uses the following libraries with the respective licenses

* jquery : MIT License
* jquery.couch : Apache 2.0 License
* node-couchdb : MIT License
* node-iniparser : MIT License
* jquery-ui : MIT / GPL License
* jquery.mustache : MIT license
* jquery.pathbinder : Apache 2.0 License
* jquery.evently : Apache 2.0 License
* jquery.form : MIT / GPL license
* jquery.colorbox : MIT license
* jquery.autocomplete : MIT / GPL license


Install
=======

* Install CouchDB, couchdb-lucene, node.js, geocouch, curl
* Install plantnet-datamanager node server

    npm -g install http://github.com/plantnet/node-datamanager/tarball/master
  
* add /etc/couchdb/local.d/datamanager.ini
<pre>
    [external]
    admin_db = nodejs /usr/bin/plantnet-dm-admin_db

    [httpd_db_handlers]
    _admin_db = {couch_httpd_external, handle_external_req, <<"admin_db">>}
    
    [httpd_global_handlers]
    _start = {couch_httpd_proxy, handle_proxy_req, <<"http://127.0.0.1:5984/datamanager/_design/start/index.html">>}
    _dm = {couch_httpd_proxy, handle_proxy_req, <<"http://127.0.0.1:5995">>}
        
    [os_daemons]
    dm_server = nodejs /usr/bin/plantnet-dm-server
</pre>

* Install main database and couchapp
<pre>
    curl -X PUT http://localhost:5984/datamanager 
    curl -H "Content-Type: application/json" -X POST http://localhost:5984/_replicate -d "{\"source\":\"http://data.plantnet-project.org/datamanager\", \"target\":\"http://localhost:5984/datamanager\"}" 
</pre>
* go to http://localhost:5984/_start


Documentation
=============

See http://community.plantnet-project.org/datamanager
See http://amap-dev.cirad.fr/projects/p2pnote/wiki



