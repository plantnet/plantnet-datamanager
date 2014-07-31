function (doc) {
    var label = doc.$label,
    geoloc;
    
    if(!label) { return; }
    
    // // find geoloc if any -> could be optimized
    //     for (var f in doc) {
    //         var v = doc[f];
    //         if (v.constructor === Array && v.length === 2 && typeof v[0] === 'number') {
    //             geoloc = v;
    //             break;
    //         }
    //     }

    // beuuuaaaaaarrrrrrk
    geoloc = doc.lonlat || doc.geoloc || doc.position || doc.location || doc.gps || doc.geoposition || doc.geolocalisation || doc.locality || doc.localite ;
    if (geoloc && geoloc.length !== 2) {
        geoloc = undefined;
    }

    var plib = require("views/lib/path"),
        parent_id = plib.get_parent(doc); 

    emit([0, doc._id], {_rev:doc._rev, label:label, modi:doc.$modi, parent:parent_id, geoloc:geoloc}); // used by editDoc and refup and treeview
    emit([doc.$mm, label], {syn:doc.$synonym}); // used for autocomplete
    emit([doc.$mm, doc.$modi, label], {syn:doc.$synonym}); // used for autocomplete

    // null parent should be marked as empty string
    emit([1, doc.$mm, parent_id ? parent_id : ''], { label:label }); // used by tree view
}
