function (app, mm) {

    var rank_id = {
        "Sans Rang" : 0,
        "Super-Règne" : 10,
        "Règne" : 20,
        "Sous-Règne" : 30,
        "Infra-Règne" : 33,
        "Super-Phylum" : 36,
        "Phylum" : 40,
        "Sous-Phylum" : 42,
        "Infra-Phylum" : 45,
        "Super-Division" : 47,
        "Division" : 50,
        "Sous-Division" : 53,
        "Infra-Division" : 56,
        "Super-Classe" : 60,
        "Cladus" : 70,
        "Classe" : 80,
        "Sous-Classe" : 90,
        "Infra-classe" : 100,
        "Legio" : 110,
        "Super-Ordre" : 120,
        "Cohorte" : 130,
        "Ordre" : 140,
        "Sous-Ordre" : 150,
        "Infra-Ordre" : 160,
        "Super-Famille" : 170,
        "Famille" : 180,
        "Sous-Famille" : 190,
        "Infra-Famille" : 193,
        "Super-Tribu" : 196,
        "Tribu" : 200,
        "Sous-Tribu" : 210,
        "Infra-Tribu" : 215,
        "Genre" : 220,
        "Sous-Genre" : 230,
        "Infra-Genre" : 235,
        "Section" : 240,
        "Sous-Section" : 250,
        "Série" : 260,
        "Sous-Série" : 270,
        "Groupe" : 275,
        "Agrégat" : 280,
        "Espèce" : 290,
        "Semi-Espèce" : 300,
        "Micro-Espèce" : 310,
        "Sous-Espèce" : 320,
        "Infra-Espèce" : 330,
        "Variété" : 340,
        "Sous-Variété" : 350,
        "Forme" : 360,
        "Sous-Forme" : 370,
        "Forma species" : 380,
        "Linea" : 390,
        "Clône" : 400,
        "Race" : 410,
        "Morpha" : 420,
        "Abberatio" : 430,
        "Plantes cultivées" : 440
    };

    var fn = app.db.name + ".csv",
    cols = [], module = mm.modules["0"], modi_rank = {};

    for (var i = 0; i < module.fields.length; i++) {
        var f = module.fields[i];
        cols.push(f.name);
    }

    for (var modi in mm.structure) {
        var title = mm.structure[modi][3];
        var rank = rank_id[title];

        if(!rank) {
            throw "Unknown rank " + title; 
        }
        modi_rank[modi] = rank;
    }

    return app.db.uri + "_design/addon_taxref/" + "_list/all2csv/all?include_docs=true" + 
        "&key=" + JSON.stringify(mm._id) +
        "&fn=" + fn +
        "&cols=" + JSON.stringify(cols) +
        "&ranks=" + JSON.stringify(modi_rank);
}