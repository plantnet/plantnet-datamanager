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

PlantNet-DataManager
--------------------
  npm -g install http://github.com/plantnet/node-datamanager/tarball/master

  curl -X PUT http://localhost:5984/datamanager 
  curl -H "Content-Type: application/json" -X POST http://localhost:5984/_replicate -d "{\"source\":\"http://data.plantnet-project.org/datamanager\", \"target\":\"http://localhost:5984/datamanager\"}" 


go to http://localhost:5984/datamanager/_start

Documentation
=============

See http://community.plantnet-project.org/datamanager
See http://amap-dev.cirad.fr/projects/p2pnote/wiki



