/*
Web service 
Return a list of plantunit


URL :  server/_dm/db/plantnet/plantunits?mm=mm_887cfdb7a2bcc93466ef9a6daa0008b5&skip=0&limit=10000

consider that mm contains 2 modi
* .0 : obs
* .0.1 : img_set
*/


function format(attchs, obs_by_id) {

    var plantunits = [];
    
    for (var i = 0, l = attchs.length; i < l; i++) {
        var attch = attchs[i],
        obs = obs_by_id[attch.value.obs_id],
        imgurl = "http://" + q.host + "/" + db.name + "/" + encodeURIComponent(attch.id) + "/" + attch.value.name;
        
        var taxa_ref = obs.$ref.taxa || obs.$ref.taxon;
        
        var plantunit = {
            id : attch.id + "/" + attch.value.name,
            image : imgurl,
            //miniature,
            //url_fiche,
            auteur_image : obs.author,
            famille : taxa_ref ? (taxa_ref[".0.0.0.0.0.0"] || taxa_ref[".0"]) : null,
            genre : taxa_ref ? taxa_ref[".0.0.0.0.0.0.0"] || taxa_ref[".0.0"] : null,
            nom_retenu : (obs.taxa || obs.taxon) + "",
            //variete,
            localite : obs.location,
            organe : attch.value.type,
            num_observation : obs._id,
            date_observation : obs.date
            //date_indexation 
            //date_creation
            //Remarques="null",
        };
        
        plantunits.push(plantunit);
    }
    q.send_json({results : plantunits});

}


function plantunits(db, mm_id, skip, limit) {
    var full_mm_id = "_design/" + mm_id;

    try {
        skip = parseInt(skip) || 0;
    } catch(Exception) {
        skip = 0;
    }

    try {
        limit = parseInt(limit) || 10000000000000000;
    } catch(Exception) {
        limit = 10000000000000000;
    }


    db.view("plantnet", "attchs", {
        startkey : [full_mm_id, ".0.1"],
        endkey : [full_mm_id, ".0.1", {}],
        skip : skip,
        limit : limit,
    }, function (err, attchs) {
        if(err) {
            q.send_error(err);
            return;
        }

        var obs_ids = [];
        var obs_ids_map = {};

        // get all obs_ids to retrieve
        attchs.rows.forEach(function (e) {
            if(!obs_ids_map[e.value.obs_id]) {
                obs_ids.push(e.value.obs_id);
            }
            obs_ids_map[e.value.obs_id] = true;
        });
        


        db.allDocs({keys:obs_ids, include_docs:true}, function (err, data) {

            if(err) {
                q.send_error(err);
                return;
            }

            var obs_by_ids = {};
            data.rows.forEach(function (e) {
                obs_by_ids[e.id] = e.doc;
            });

            
            format(attchs.rows, obs_by_ids);
        });

    });
}



plantunits(q.db, q.params.mm, q.params.skip, q.params.limit);