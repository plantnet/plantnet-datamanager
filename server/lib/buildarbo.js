/**
 * Portage of the "buildarbo" list to Node.js
 */
// setting "related_mod" to true makes the code compatible with "related_mod" view,
// otherwise it expects keys from "related" view
exports.buildarbo = function (viewCols, inputData, related_mod) {

    function parse_param (param) { // copied from libmachintruc
        // list all field by type
        var fields = {};
        for (var m = 0; m < param.length; m++) {
            var t = param[m].$modi;
            fields[t] = fields[t] || [];
            fields[t].push([param[m].field, m]);
        }
        return fields;
    };

    var fields = parse_param(viewCols);

    // optimization of needed/unneeded modis
    var neededCache = {};

    // return map of doc grouped by type
    function format(data) {
        var ret = JSON.stringify(data);
        return ret;
    }

    // returns true if docs of a given modi are required to build the view
    function modiNeeded(modi, cols) {
        var ret = true;
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
                // if a modt is required by a column (is it relevant?), then any modi of this modt is required
                if (modi.substr(modi.lastIndexOf('.') + 1) == c) {
                    needed = true;
                    break;
                }
            }
            neededCache[modi] = needed;
            ret = needed;
        }
        return ret;
    }

    // construit une arborescence pour les "related" d'un doc (une branche)
    function constructArbo(data) {

        if (data.nodes.length == 0) {
            return;
        }

        data.sons = {};
        data.nodes.sort(function(doca, docb) {
            return (doca.$path.length - docb.$path.length);
        });

        // parcours des noeuds par profondeur croissante
        var minProf = data.nodes[0].$path.length;
        for (var i = 0; i < data.nodes.length; i++) {
            var doc = data.nodes[i];
            if (doc.$path.length == minProf) { // une des racines (de l'arbre ou du sous-arbre)
                //log('trouvé une racine: ' + doc._id);
                data.sons[doc._id] = { // new node
                    doc: doc,
                    sons: {},
                    //parent: null
                };
            } else {
                var ptr = data;
                //log('ptr = data');
                for (var p = 0; p < doc.$path.length; p++) { // on descend les parents (façon de parler)
                    var pe = doc.$path[p];
                    // attention aux parents optionnels
                    if (pe) {
                        //log('ptr = ptr.sons[' + pe + ']');
                        if (pe in ptr.sons) { // si on a sauté des modi, la parenté a des trous // @TODO vérifier que c'est juste
                            ptr = ptr.sons[pe]; // get down on it
                        }
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
    }

    // list all fields by type
    var id,
        prev_id = null,
        row,
        data = {},
        outputList = [],
        pushed = 0;

    // for each input row
    for (var i=0; i < inputData.length; i++) {

        row = inputData[i];
        // group sub-trees by key
        if (related_mod) {
            id = row.key[0]; // when using view related_mod view
        } else {
            id = row.key; // when using view related
        }
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
            outputList.push(data);
            // reinit
            data = {
                doc: row.doc,
                nodes: []
            };
            prev_id = id;
        }

        if(row.doc) {
            //log(row);
            row.doc._attchs = (row.value ? row.value._attchs : null);
            // retrocompatibility
            if ((! row.doc.$path) && (row.value)) {
                row.doc.$path = row.value.path;
            }
            // add to data for further tree building
            // optimisation: si aucune des colonnes demandées dans la vue ne porte
            // sur le modi du doc ou les modis "en dessous", on vire le doc (élagage)
            //log('needed', row.doc.$modi, fields);
            if (modiNeeded(row.doc.$modi, fields)) {
                data.nodes.push(row.doc);
                pushed++;
            }
        }
    }

    // send last line
    if (inputData.length) { // beware of empty inputData
        constructArbo(data);
        if (data) {
            outputList.push(data);
        }
    }

    return {
        rows: outputList
    };
}