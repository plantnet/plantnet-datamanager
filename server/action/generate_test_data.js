// generate example data

var uid = require("uid");
function GUID ()
{
    var S4 = function ()
    {
        return Math.floor(
                Math.random() * 0x10000 /* 65536 */
            ).toString(16);
    };

    return (
            S4() + S4() +
            S4() + 
            S4() + 
            S4() + 
            S4() + S4() + S4()
        );
}

function _generateId(mm, doc, parent_doc) {
    doc._id = uid.build_id(doc);
    if(!doc._id) { doc._id = mm._id.slice(8) + "##" + GUID() };

    if(parent_doc) {
        doc.$path = parent_doc.$path.concat(parent_doc._id);
    } else {
        doc.$path = [];
    }
    return doc;
}

var generate_taxo_ref = function() {
    var taxo_model_id = '_design/mm_taxo_ref';

    var mm = {
        _id : taxo_model_id,
        name: 'test:taxo1',
        $type: 'mm',
        desc: '',
        isref: true,
        
        modules: {
            famille: {
                name: 'famille',
                desc: 'Noms scientifiques des Familles',
                fields: [{
                        name: 'name',
                        label: 'Family name',
                        type: 'text', 
                        desc: 'The family name', 
                        uniq: true
                    }, {
                        name: 'author',
                        label: 'Auteur',
                        type: 'text', 
                        desc: 'The author of this name', 
                    }, {
                        name: 'year',
                        label: 'date',
                        type: 'text', 
                        desc: 'The year of publication', 
                    }],
                label_tpl: '${name}'
            },
            genre: {
                name: 'genre',
                desc: 'Noms scientifiques des Genres',
                fields: [
                    {
                        name: 'name',
                        label: 'Genus name',
                        type: 'text', 
                        desc: 'The genus name', 
                        uniq: true
                    }, {
                        name: 'author',
                        label: 'Auteur',
                        type: 'text', 
                        desc: 'The author of this name', 
                    }, {
                        name: 'year',
                        label: 'Année',
                        type: 'date', 
                        desc: 'The year of publication', 
                    }],
                label_tpl: '${name}'
            },
            espece: {
                name: 'espece',
                desc: 'Épithète des espèces',
                fields: [
                    {
                        name: 'name',
                        label: 'Species name',
                        type: 'text',
                        desc: 'The species name',
                        uniq: true
                    }, {
                        name: 'author',
                        label: 'Auteur',
                        type: 'text', 
                        desc: 'The author of this name', 
                    }, {
                        name: 'year',
                        label: 'Année',
                        type: 'date', 
                        desc: 'The year of publication', 
                    }, {
                        name: 'wikipedia_url',
                        label: 'Wikipedia',
                        type: 'url', 
                        desc: 'The Wikipedia web adress for this species', 
                    }, {
                        name: 'comment',
                        label: 'Remarques',
                        type: 'longtext', 
                        desc: 'A comment on this name', 
                    }],
                label_tpl: '${parent.name} ${name}'
            }
        },
        structure: {
            '.famille': ['famille', ''],
            '.famille.genre': ['genre', '.famille'],
            '.famille.genre.espece': ['espece', '.famille.genre']
        }
    };


    var taxodocs = [], d;
    d = {
        name: 'Amaranthaceae',
        author: 'Juss.',
        year: '1789',
        $mm: taxo_model_id,
        $modt: 'famille',
        $modi: '.famille'
    };
    var amaranthaceae = d;
    taxodocs.push(_generateId(mm, d));
    
    d = {
        name: 'Fabaceae',
        author: 'Lindl.',
        year: '1836',
        $mm: taxo_model_id,
        $modt: 'famille',
        $modi: '.famille'
    };
    var fabaceae = d;
    taxodocs.push(_generateId(mm, d));

    d = {
        name: 'Achyranthes',
        author: 'L.',
        year: '1753',
        $mm: taxo_model_id,
        $modt: 'genre',
        $modi: '.famille.genre'
    };
    var achyranthes = d;
    taxodocs.push(_generateId(mm, d, amaranthaceae));
   
    d = {
        name: 'Acacia',
        author: 'P. Miller',
        year: '1754',
        $mm: taxo_model_id,
        $modt: 'genre',
        $modi: '.famille.genre'
    };
    var acacia =  d;
    taxodocs.push(_generateId(mm, d, fabaceae));

    // espece
    d = {
        name: 'mangium',
        author: 'Willd.',
        year: '1806',
        wikipedia_url: 'http://fr.wikipedia.org/wiki/Acacia_mangium',
        $mm: taxo_model_id,
        $modt: 'espece',
        $modi: '.famille.genre.espece'
    };
    taxodocs.push(_generateId(mm, d, acacia));

    d = {
        name: 'cultriformis',
        author: 'A.Cunn. ex G.Don',
        year: '1832',
        wikipedia_url: 'http://fr.wikipedia.org/wiki/Acacia_cultriformis',
        $mm: taxo_model_id,
        $modt: 'espece',
        $modi: '.famille.genre.espece'
    };
    taxodocs.push(_generateId(mm, d, acacia));

    d = {
        name: 'denticulosa',
        author: 'F.Muell.',
        year: '1876',
        wikipedia_url: 'http://fr.wikipedia.org/wiki/Acacia_denticulosa',
        $mm: taxo_model_id,
        $modt: 'espece',
        $modi: '.famille.genre.espece'
    };
    taxodocs.push(_generateId(mm, d, acacia));

    d = {
        name: 'harpophylla',
        author: 'F.Muell. ex Benth.',
        year: '1864',
        wikipedia_url: 'http://fr.wikipedia.org/wiki/Acacia_harpophylla',
        $mm: taxo_model_id,
        $modt: 'espece',
        $modi: '.famille.genre.espece'
    };
    taxodocs.push(_generateId(mm, d, acacia));

    d = {
        name: 'implexa',
        author: 'Benth.',
        year: '1842',
        wikipedia_url: 'http://fr.wikipedia.org/wiki/Acacia_implexa',
        $mm: taxo_model_id,
        $modt: 'espece',
        $modi:'.famille.genre.espece'
    };
    taxodocs.push(_generateId(mm, d, acacia));

    d = {
        name: 'atollensis',
        author: 'H.St.John',
        year: '1980',
        wikipedia_url: 'http://en.wikipedia.org/wiki/Achyranthes_atollensis',
        $mm: taxo_model_id,
        $modt: 'espece',
        $modi: '.famille.genre.espece'
    };
    taxodocs.push(_generateId(mm, d, achyranthes));

    d = {
        name: 'aspera',
        author: 'L.',
        year: '1753',
        wikipedia_url: 'http://fr.wikipedia.org/wiki/Achyranthes_aspera',
        $mm: taxo_model_id,
        $modt: 'espece',
        $modi: '.famille.genre.espece'
    };
    taxodocs.push(_generateId(mm, d, achyranthes));

    d = {
        name: 'vulgaris',
        comment: 'Test avec id + ##',
        $mm: taxo_model_id,
        $modt: 'espece',
        $modi: '.famille.genre.espece'
    };
    taxodocs.push(_generateId(mm, d, amaranthaceae));

    return {mm: mm, docs: taxodocs};
};

var generate_individu = function(taxo_ref_mm, size) {
    size = size || 100;
    var bota_model_id = '_design/mm_individu_bota';

    var mm = {
        _id: bota_model_id,
        name: 'test:botanic1',
        $type: 'mm',
        desc: '',
        isref: false,
        
        modules: {
            individu: {
                name: 'individu',
                desc: 'Individu',
                label_tpl : "indi ${date}",
                fields: [{
                    name: 'date',
                    label: 'Date',
                    type: 'date', 
                    desc: 'The date'}]
            },
            determination: {
                name: 'determination',
                desc: 'determination',
                label_tpl : "det ${taxon}",

                fields: [
                    {
                        name: 'date',
                        label: 'Date',
                        type: 'date',
                        desc: 'date'
                    }, {
                        name: 'taxon',
                        label: 'Taxon',
                        type: 'ref', 
                        desc: 'taxon',
                        mm: taxo_ref_mm._id
                    }, {
                        name: 'auteur',
                        label: 'Auteur',
                        type: 'enum',
                        desc:'auteur',
                        values : ['SDK', 'PB', 'BL', 'JFM']
                    }, {
                        name: 'position',
                        label: 'Position',
                        type: 'geoloc',
                        desc: 'position'
                    }]
            },
            herbier: {
                name: 'herbier',
                desc: 'Herbier',
                label_tpl : "herb ${name}",
                fields: [
                     {
                         name: 'name',
                         label: 'Nom',
                         type: 'text',
                         default_value: 'Mon herbier',
                         desc: 'Champt de type texte (text)'
                     }, {
                         name: 'longtext_field',
                         label: 'Chp texte long',
                         type: 'longtext',
                         default_value: 'En botanique et en mycologie, un herbier est une collection de plantes1 ' + 
                             'séchées et pressées entre des feuilles de papier qui sert de support physique à ' + 
                             'différentes études sur les plantes, et principalement à la taxinomie et à la ' + 
                             'systématique. Le terme herbier (herbarium) désigne aussi l’établissement ou l’' + 
                             'institution qui assure la conservation d’une telle collection. Constitués au fil ' + 
                             'du temps, les nombreux herbiers, publics et privés, existant dans le monde ' + 
                             'constituent un matériel indispensable à la typification et aux études botaniques.',
                         desc: 'Champ de type texte long (longtext)'
                     }, {
                         name: 'boolean_field',
                         label: 'Chp booléen',
                         type: 'boolean',
                         default_value: false,
                         desc: 'Champ de type booléen (boolean)'
                     }, {
                         name: 'integer_field',
                         label: 'Chp nbre entier',
                         type: 'integer',
                         default_value: 42,
                         desc: 'Champ de type nombre entier positif ou négatif (integer)'
                     }, {
                         name: 'float_field',
                         label: 'Chp nbre flottant',
                         type: 'float',
                         default_value: 1.42,
                         desc: 'Champ de type nombre flottant (float)'
                     }, {
                         name: 'date_field',
                         label: 'Chp date',
                         type: 'date',
                         default_value: '2012-12-21',
                         desc: 'Champ de type date (date)'
                     }, {
                         name: 'time_field',
                         label: 'Chp time',
                         type: 'time',
                         default_value: '13:13:13',
                         desc: 'Champ de type heure (time)'
                     }, {
                         name: 'url_field',
                         label: 'Chp url',
                         type: 'url',
                         default_value: 'http://www.plantnet-project.org',
                         desc: 'Champ de type URL (url)'
                     }, {
                         name: 'geoloc_field',
                         label: 'Chp coordonnées',
                         type: 'geoloc',
                         default_value: getRandomPos(),
                         desc: 'Champ de type coordonnées (geoloc)'
                     }, {
                         name: 'enum_field',
                         label: 'Chp enum',
                         type: 'enum',
                         default_value: 'epiphyte',
                         desc: 'Champ de type liste (enum)',
                         values: ['arbre', 'herbe', 'epiphyte', 'liane']
                     }, {
                         name: 'multi-enum_field',
                         label: 'Chp multi-enum',
                         type: 'multi-enum',
                         default_value: ['Tige', 'Habitus'],
                         desc: 'Champ de type liste multiple (multi-enum)',
                         values: ['Fleur', 'Feuille', 'Tige', 'Racines', 'Habitus']
                     }, {
                         name: 'range_field',
                         label: 'Chp range',
                         type: 'range',
                         default_value: 42,
                         desc: 'Champ de type plage de valeurs (range)',
                         min: -100, 
                         max: 100, 
                         step: 5
                     }
                 ]
            },
            observation: {
                name: 'observation',
                desc: 'observation',
                label_tpl : 'obs ${type_biologique}',
                fields: [
                     {
                         name: 'type_biologique',
                         label: 'Type biologique',
                         type: 'enum',
                         desc: '',
                         values: ['arbre', 'herbe', 'epiphyte', 'liane']
                     }, {
                         name: 'dominance',
                         label: 'Dominance',
                         type: 'integer',
                         desc: ''
                     }]
            }
        },
        structure: {
            '.individu': ['individu', ''],
            '.individu.herbier': ['herbier', '.individu'], 
            '.individu.determination': ['determination', '.individu'],
            '.individu.herbier.determination': ['determination', '.individu.herbier'],
            '.individu.observation': ['observation', '.individu']
        }
    };

    var docs = [];

    // individus
    var authors = ['JFM', 'PB', 'SDK', 'BL', 'FG', 'FT'],
        taxons = ['Achyranthes aspera',
                  'Achyranthes atollensis',
                  'Acacia mangium', 
                  'Acacia cultriformis',
                  'Acacia denticulosa', 
                  'Acacia harpophylla',
                  'Acacia implexa'],
        dominances = [1,2,3,4,5,6,7,8,9,10],
        type_biologiques = ['arbre', 'herbe', 'epiphyte', 'liane'],
        dates = ['2011-01-03', '1978-02-04', '1978-01-05'];

    function getValue(a, i) {
        var l = a.length;
        i = Math.floor(Math.random() * l);
        var val = a[i];
        if (val == '') { $.log(i, a); };
        return val;
    }

    function getRandomPos() {
        var lng = getRandomInRange(-180, 180, 5),
            lat = getRandomInRange(-90, 90, 5),
            pos = [lng, lat];
        return pos;
    }
    
    // From Stack Overflow : http://stackoverflow.com/questions/6878761/javascript-how-to-create-random-longitude-and-latitudes
    function getRandomInRange(from, to, fixed) {
        return (Math.random() * (to - from) + from).toFixed(fixed) * 1;
        // .toFixed() returns string, so ' * 1' is a trick to convert to number
    }

    for (var i = 0; i < size; i++) {
        var individu = {
            $modi: '.individu', 
            $modt: 'individu',
            $mm: bota_model_id,
            date: getValue(dates, i),
            $sons: {}
        };
        _generateId(mm, individu);
        
        // observation
        var individuObs = {
            $modt: 'observation', 
            $modi: '.individu.observation', 
            $mm: bota_model_id,
            type_biologique: getValue(type_biologiques, i), 
            dominance: getValue(dominances, i), 
            auteur: getValue(authors, i),
            $sons: {}
        };
        _generateId(mm, individuObs, individu);
        
        // determination
        var individuDet = { 
            $modt: 'determination',
            $modi: '.individu.determination',
            $mm: bota_model_id,
            taxon: getValue(taxons, i), 
            auteur: getValue(authors, i), 
            date: getValue(dates, i),
            position: getRandomPos(),
            $sons: {}
        };
        _generateId(mm, individuDet, individu);
                
        var individuHerb = { 
            $modi: '.individu.herbier',
            $modt: 'herbier',
            $mm: bota_model_id,
            name: 'unHerbier' + i,
            $sons: {}
        };
        _generateId(mm, individuHerb, individu);

       var herbierDet = {
           $modi: '.individu.herbier.determination',
           $modt: 'determination',
           $mm: bota_model_id,
           taxon: getValue(taxons, i),
           auteur: getValue(authors, i), 
           date: getValue(dates, i),
       };
        _generateId(mm, herbierDet, individuHerb);

        docs = docs.concat([individu, individuDet, individuHerb, individuObs, herbierDet]);
    }
    

    return {
        mm: mm,
        docs: docs
    };
};

    
var generate_data_bota = function(db, cb) {
    var docs = [];

    // taxo
    var taxo_ref = generate_taxo_ref();
    docs = docs.concat(taxo_ref.docs);
    docs.push(taxo_ref.mm);


    var bota_data = generate_individu(taxo_ref.mm, 100);
    docs = docs.concat(bota_data.docs);
    docs.push(bota_data.mm);

    db.bulkDocs({docs: docs}, function (err, data) {
        if(err) { cb(err, data); }
        else { 
            cb(null, { mm_ref_id : taxo_ref.mm._id,
                       mm_obs_id : bota_data.mm._id
                     });
             }
    });
};


generate_data_bota(q.db, function (err, data) {
    if(err) {
        q.send_err(err);
    } else {
        q.send_json(data);
    }
});