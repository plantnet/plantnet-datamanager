function import_taxref(app, db, filename, data, mm, param, onSuccess, onError) {

    var rank_label = {
        0:"Sans Rang",
        10:"Super-Règne",
        20:"Règne",
        30:"Sous-Règne",
        33:"Infra-Règne",
        36:"Super-Phylum",
        40:"Phylum",
        42:"Sous-Phylum",
        45:"Infra-Phylum",
        47:"Super-Division",
        50:"Division",
        53:"Sous-Division",
        56:"Infra-Division",
        60:"Super-Classe",
        70:"Cladus",
        80:"Classe",
        90:"Sous-Classe",
        100:"Infra-classe",
        110:"Legio",
        120:"Super-Ordre",
        130:"Cohorte",
        140:"Ordre",
        150:"Sous-Ordre",
        160:"Infra-Ordre",
        170:"Super-Famille",
        180:"Famille",
        190:"Sous-Famille",
        193:"Infra-Famille",
        196:"Super-Tribu",
        200:"Tribu",
        210:"Sous-Tribu",
        215:"Infra-Tribu",
        220:"Genre",
        230:"Sous-Genre",
        235:"Infra-Genre",
        240:"Section",
        250:"Sous-Section",
        260:"Série",
        270:"Sous-Série",
        275:"Groupe",
        280:"Agrégat",
        290:"Espèce",
        300:"Semi-Espèce",
        310:"Micro-Espèce",
        320:"Sous-Espèce",
        330:"Infra-Espèce",
        340:"Variété",
        350:"Sous-Variété",
        360:"Forme",
        370:"Sous-Forme",
        380:"Forma species",
        390:"Linea",
        400:"Clône",
        410:"Race",
        420:"Morpha",
        430:"Abberatio",
        440:"Plantes cultivées"
    };

    var csv2array = app.getlib("import").CSVToArray;
    var MM = app.getlib("mm");

    data = csv2array(data, param || ","); 

    // Create MM
    var doc_by_id = {}, docs = [], parent = {}, ranks = {}, sranks = [];

    if (!mm) {
        mm = { _id : "_design/mm_" + $.couch.newUUID(),
               $type : "mm",
               isref : true,
               name : "TaxRef - " + filename,
               desc : ""
             };
    }

    mm.modules = { "0" : {
        name : "Taxon",
        desc : "",
        fields : [],
        index_tpl : "${num_nom}",
        label_tpl : "${nom_sci} ${auteur}"
    }};
    mm.structure = {};
   

    // get fields
    var ignore_field = {
        num_tax_sup : true,
        num_nom_retenu : true,
        rang : true
    };
    
    var d = data[0], fields = mm.modules["0"].fields, type, fake_fields = [];
    for (var i = 0; i < d.length; i++) {
        var fi = {name : d[i],
                  type : (d[i].slice(0,4) == "num_" || 
                          d[i] == "rang" || 
                          d[i] == "exclure_taxref") ? "integer" : "text"
                 };
        fake_fields.push(fi);
        if (!ignore_field[d[i]]) { 
            fields.push(fi);
        }
    }

    // create doc
    var dups = [];
    for (var i = 1; i < data.length; i++) {
        d = data[i];
        var doc = {};

        doc.$mm = mm._id;
        doc.$modt = "0";
        doc.$modi = ".0"; // to complete

        if(d.length > fake_fields.length) {
            $.log("Pb with separator in csv", d, fake_fields);
            throw "Pb with separator in csv"; 
        }

        for (var j = 0; j < d.length; j++) {
            var v = d[j];
            if (v) {
                v = app.libs.utils.convert(v, fake_fields[j].type);
                doc[fake_fields[j].name] = v;
            }
        }

        if(doc.num_nom) { 
            doc._id = doc.$mm.slice(8) + '##' + doc.num_nom;

            ranks[doc.rang || "0"] = true;

            if(doc_by_id[doc.num_nom]) {
                dups.push(doc.num_nom);
            }
            doc_by_id[doc.num_nom] = doc;
            docs.push(doc);
        }
    }

    // check dups
    if (dups.length) {
        $.log("duplicated num_nom " + dups);
        //throw "duplicated num_nom " + JSON.stringify(dups); 
    }

    // check parent
    var unknown_parents = [], parent_error = false;

    for (var i in doc_by_id) {
        var p = doc_by_id[i].num_tax_sup;
        if (!doc_by_id[p]) {
            unknown_parents[p] = true;
            parent_error = true;
        }
    }
    if (parent_error) {
        $.log(unknown_parents);
        for (var p in unknown_parents) {
            $.log("unknown parent : " + p);
        }
    }


    // sort founded ranks
    for (var r in ranks) { sranks.push(parseInt(r)); }
    sranks.sort(function (a,b) {return a - b;});

    // get parents
    for (var i in doc_by_id) {
        d = doc_by_id[i];

        var p = d.num_tax_sup;
        var n = d.num_nom;

        if (n && p) { parent[n] = p; }
    }

    // create path 
    for (var i in doc_by_id) {
        d = doc_by_id[i];
        d.$modi = ".0";

        var rank_i, rank_j,
        path = [],
        current = d.num_nom;

        while (parent[current]) {

            if (parent[current] == current) {
                $.log(current + " has itself for parent");
                 throw current + " has itself for parent"; 
            };

            rank_i = sranks.indexOf(doc_by_id[current].rang); // rank index of current
            var sav_current = current;
            current = parent[current]; // parent -> current

            // if there is a parent
            if (current) {
                if (!doc_by_id[current]) { 
                    $.log("Unknown parent " + current);
                    throw "Unknown parent " + current; 
                }
                rank_j = sranks.indexOf(doc_by_id[current].rang); // rank index of parent
            } else { // no parent
                rank_j = 0;
            }

            // fill with optional ranks
            if (rank_i < rank_j) {
                $.log("Rank error for sons of " + current);
                throw "Rank error for sons of " + current 
                    + " (" + sav_current + ")" 
                    + doc_by_id[current].rang + " "
                    + doc_by_id[sav_current].rang;
            }
            for (var c = rank_i - 1; c > rank_j && c > 0; c--) {
                path.push("");
                d.$modi += ".0";
            }

            path.push(d.$mm.slice(8) + "##" + current);
            d.$modi += ".0";
        }
        
        // fill path to root
        if (current) {
            rank_i = sranks.indexOf(doc_by_id[current].rang);
            for (var c = rank_i - 1; c >= 0; c--) {
                path.push("");
                d.$modi += ".0";
            }
        }
            
        path.reverse();
        d.$path = path
    }

    // set synonym
    for (var i in doc_by_id) {
        d = doc_by_id[i];
        if (d.num_nom_retenu != d.num_nom && d.num_nom_retenu) {
            if (!doc_by_id[d.num_nom_retenu]) {
                $.log("Unknown num_nom_retenu " + d.num_nom_retenu);
                throw "Unknown num_nom_retenu " + d.num_nom_retenu;
            }
            d.$synonym = doc_by_id[d.num_nom_retenu]._id;
        }

        for(var ifield in ignore_field) {
            delete d[ifield];
        }
    }
    

    // create mm structure
    var modis = [null], modi, pmodi;

    for (var i = 0; i < sranks.length; i++) {

        modis.push("0");
        modi = modis.join(".");
        pmodi = modis.slice(0, -1).join(".");
        mm.structure[modi]= ["0", pmodi, true, rank_label[sranks[i]]];
    }
   
    $.log(mm);
    MM.validate_mm(mm, app);



    db.allDocs({
        startkey: mm._id.slice(8),
        endkey: mm._id.slice(8) + "\ufff0",
        success: function (alldocs) {
            
            //
            for (var i = 0; i < alldocs.rows.length; i++) {
                var r = alldocs.rows[i], d,
                nn = r.id.split("##")[1]; // num_nom

                // update _rev if docs exists
                if (doc_by_id[nn]) {
                    doc_by_id[nn]._rev = r.value.rev;
                } else { // delete doc
                    var d = {
                        _id : r.id,
                        _rev : r.value.rev,
                        _deleted : true
                    }
                    docs.push(d);
                }
            }

            $.log("save mm");
            db.saveDoc(mm, {
                error : onError,
                success : function () {
                    $.log("uploading " + docs.length + " docs");
                    db.bulkSave({docs : docs, 'all_or_nothing' : true}, {
                        success : function () {
                            $.log("update mm");
                            db.dm("update_mm", {mm : mm._id}, null, onSuccess, onError);
                        },
                        error : onError
                    });
                }
            });


        },
        error : onError
    });
    

}