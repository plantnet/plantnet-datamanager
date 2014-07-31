/**
 * Returns an arborescent Map for each key of the given docs
 * Received docs must have a $path attribute
 * Keys must be a single value
 */
function (head, req) {

    var stat = {
        preparation: 0,
        modiNeeded: 0,
        JSONformatting: 0,
        treeBuilding: {
            nodesSorting: 0,
            building: 0,
            SUM: 0,
            TOTAL: 0
        },
        SUM: 0,
        TOTAL: 0
    }; // time measurement

    var prepS = new Date().getTime();
    var lib = require('vendor/datamanager/lib/commonddoc');

    // view cols
    var param = req.query.param;
    if (param) {
        param = JSON.parse(param);
    }
    var fields = lib.parse_param(param);

    // optimization of needed/unneeded modis
    var neededCache = {};

    // return map of doc grouped by type
    function format(data) {
        var s = new Date().getTime();
        var ret = JSON.stringify(data);
        var e = new Date().getTime();
        stat.JSONformatting += (e - s);
        return ret;
    }

    // returns true if docs of a given modi are required to build the view
    function modiNeeded(modi, cols) {
        var ret = true;
        var s = new Date().getTime();
        if (modi in neededCache) {
            ret = neededCache[modi];
        } else {
            var needed = false;
            for (var c in cols) {
                // if c.startsWith(modi)
                if (c.slice(0, modi.length) == modi) {
                    needed = true;
                    break;
                }
            }
            neededCache[modi] = needed;
            ret = needed;
        }
        var e = new Date().getTime();
        stat.modiNeeded += (e - s);
        return ret;
    }

    // construit une arborescence pour les "related" d'un doc
    function constructArbo(data) {

        var caS = new Date().getTime();

        data.sons = {};
        data.nodes.sort(function(doca, docb) {
            return (doca.$path.length - docb.$path.length);
        });

        var nsE = new Date().getTime();
        stat.treeBuilding.nodesSorting += (nsE - caS);

        // parcours des noeuds par profondeur croissante
        for (var i = 0; i < data.nodes.length; i++) {
            var doc = data.nodes[i];
            if (doc.$path.length == 0) { // une des racines
                data.sons[doc._id] = { // new node
                    doc: doc,
                    sons: {},
                    //parent: null
                };
            } else {
                var ptr = data;
                for (var p = 0; p < doc.$path.length; p++) { // on descend les parents (façon de parler)
                    var pe = doc.$path[p];
                    // attention aux parents optionnels
                    if (pe) {
                        ptr = ptr.sons[pe]; // get down on it
                    }
                }
                ptr.sons[doc._id] = { // new node under parent
                    doc: doc,
                    sons: {},
                    //parent: ptr
                };
            }
        }

        // nettoyage
        delete data.nodes;

        var caE = new Date().getTime();
        stat.treeBuilding.TOTAL += (caE - caS);
        stat.treeBuilding.building += (caE - nsE);
    }

    start({
        "headers": {
            "Content-Type": "application/json"
        }
    });

    send('{"rows":[');

    // list all field by type
    var id,
        prev_id = null,
        row,
        data = {},
        pushed = 0;

    var prepE = new Date().getTime();
    stat.preparation = (prepE - prepS);

    // for each input row
    while ((row = getRow())) {

        // group sub-arborescences by key
        id = row.key;
        if (prev_id === null) {
            prev_id = id;
            data = {
                doc: row.doc,
                nodes: []
            };
        }

        // key change
        if (id !== prev_id) {
            constructArbo(data);
            send(format(data) + ',\n');
            // reinit
            data = {
                doc: row.doc,
                nodes: []
            };
            prev_id = id;
        }

        if(row.doc) {
            row.doc._attchs = row.value._attchs;
            // retrocompatibility
            if (! row.doc.$path) {
                row.doc.$path = row.value.path;
            }
            // add to data for further tree building
            // optimisation: si aucune des colonnes demandées dans la vue ne porte
            // sur le modi du doc ou les modis "en dessous", on vire le doc (élagage)
            if (modiNeeded(row.doc.$modi, fields)) {
                data.nodes.push(row.doc);
                pushed++;
            }
        }
    }

    // send last line
    constructArbo(data);
    var out = format(data);
    if(out != "{}") {
        send(out + '\n'); 
    }

    // finalizing stats
    var listE = new Date().getTime();
    stat.treeBuilding.SUM = (stat.treeBuilding.nodesSorting + stat.treeBuilding.building);
    stat.SUM = (stat.preparation + stat.JSONformatting + stat.treeBuilding.SUM + stat.modiNeeded);
    stat.TOTAL = (listE - prepS);

    send('], "stat": ' + JSON.stringify(stat) + '}');
    //log('TOTAL POUCHAIDE: ' + pushed);
}