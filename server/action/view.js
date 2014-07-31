// server side "views" implementation

var ba = require('buildarbo'),
    query = require('query'),
    commons = require('commons');

var p = q.params,
    d = q.data,
    view,
    refModi = null,
    modi_labels = null,
    group = true, // If false, one row per branch (leaf) in the tree.
          // If true, one row per doc of the reference modi, multiple values per cell for docs lower in the tree
    olpa = false, // OneLinePerAttachment. If true, repeats the lines having multiple attachments, in order to obtain
        // one attachment per line
    viewColsByModi = {},
    viewModis = [],
    indexOfUniqueCol = null,
    sort = [],
    keys = [],
    filter_id = null,
    openedFilter = null,
    lq = null,
    keysAlreadySorted = false,
    skip = null,
    limit = 666666666, // lucene forces to use a "limit" parameter, or defaults to 25 :-(
    luceneTotalRows = null,
    csv = false,
    fileName = null,
    separator = ',',
    fileBuffer = '';

// merge GET and POSTS parameters, with POST having precedence over GET (maybe do the opposite?)
p = commons.mergeObjects(p, d);

if (p.view) {
    view = JSON.parse(p.view);
}
if (p.group) {
    group = JSON.parse(p.group);
}
if (p.olpa) {
    olpa = JSON.parse(p.olpa);
}
if (p.modilabels) {
    modi_labels = JSON.parse(p.modilabels);
}
if (p.sort) {
    sort = JSON.parse(p.sort);
}
if (p.filter) {
    filter_id = JSON.parse(p.filter);
    if (filter_id == '0') {
        filter_id = null;
    }
}
if (p.q) {
    lq = JSON.parse(p.q);
}
if (p.qskip) {
    skip = JSON.parse(p.qskip);
}
if (p.qlimit) {
    limit = JSON.parse(p.qlimit);
}
if (p.refmodi) {
    refModi = p.refmodi;
}
if (p.csv) {
    csv = JSON.parse(p.csv);
}
if (p.filename) {
    fileName = p.filename;
}
if (p.separator) {
    separator = p.separator;
}

if (csv) {
    log('opening stream');
    q.start_stream(fileName);
    q.send_chunk(''); // flushes headers and puts the client in wait for data (i.e. makes the browser's "download" window appear)
}

//log('refModi: ' + refModi + ', group: ' + group + ', filter_id: ' + filter_id + ', csv: ' + csv + ', filename: ' + fileName + ', separator: ' + separator + ', skip: ' + skip + ', limit: ' + limit + ', q: ' + JSON.stringify(lq));
//log('sort', sort);

// 1) if "view" is an id, open view; else use provided view
if (typeof view == 'string') {
    db.getDoc(view, function(err, viewDoc) {
        if(err) {
            q.send_error('err 001 ' + JSON.stringify(err));
            return;
        }
        view = viewDoc;
        // 2)
        prepareViewAndCallLuceneOrByModOrFilter(viewDoc);
    });
} else {
    prepareViewAndCallLuceneOrByModOrFilter(view);
}

// 2) Prepares view cols by modi, and either: calls Lucene, calls Couchdb view "by_mod", or processes a filter if any
function prepareViewAndCallLuceneOrByModOrFilter(view) {

    // test empty view
    if (!view.$cols || !view.$cols.length) {
        q.send_error('View has no column');
        return;
    }

    // add modis' names in view cols, for further usage (CSV export)
    if (modi_labels) {
        for (var c=0; c < view.$cols.length; c++) {
            view.$cols[c].label_modi = modi_labels[c];
        }
    }

    // prepare view cols by modi
    for (var vc in view.$cols) {
        var col = view.$cols[vc];
        if (viewModis.indexOf(col.$modi) == -1) {
            viewModis.push(col.$modi);
        }
        if (! viewColsByModi[col.$modi]) {
            viewColsByModi[col.$modi] = [];
        }
        viewColsByModi[col.$modi].push({
            field: col.field,
            //label: col.label,
            type: col.type,
            order: vc
        });
        // find the column index for the unique field, if specified
        if (view.$unique) { // @TODO should take modi in account: what if same col name exists in different modis?
            if (col.field == view.$unique) {
                indexOfUniqueCol = vc;
            }
        }
    }
    //log('VCBM', viewColsByModi);

    // 2a) if a filter was specified, process it to obtain keys - it has priority over "q" parameter
    if (filter_id !== null) {
        if (filter_id.substr(0, 7) == 'lucene:') { // uiiik
            log('processing direct lucene query for quickSearch export');
            // direct lucene query - beware of cracratization
            var dq = filter_id.slice(7);
            openedFilter = {
                _id: filter_id
            }
            query.direct_lucene_query(q.client, q.db, dq, function(ids) {
                ids = commons.unique(ids);
                luceneTotalRows = ids.length;
                log('Using ' + ids.length + ' keys coming from direct lucene query');
                // 3)
                getRelatedTrees(ids, view);
            });
        } else {
            log('opening filter');
            db.getDoc(filter_id, function(err, filter) {
                if(err) {
                    q.send_error('err 007 ' + JSON.stringify(err));
                    return;
                }
                openedFilter = filter;
                if (filter.$type === 'query') {
                    log('processing query filter');
                    // run "query" - involves multiple calls to lucene_query()
                    query.query(q.client, q.db, filter, function(ids) {
                        ids = commons.unique(ids);
                        luceneTotalRows = ids.length;
                        log('Using ' + ids.length + ' keys coming from complex query');
                        // 3)
                        getRelatedTrees(ids, view);
                    }, function(err) {
                        q.send_error('err 654: ' + err);
                    });
                } else if (filter.$type == 'selection') {
                    // WTF? Where the f**k in the interface can a user send a selection to a view?
                    log('Using ' + filter.ids.length + ' keys coming from selection');
                    // 3)
                    getRelatedTrees(filter.ids, view);
                } else {
                    log('unknown filter', filter);
                    q.send_error('err 427: unknown filter type');
                }
            });
        }
    } else { // no filter defined
        log('reading lucene query: ' + JSON.stringify(lq));
        // if a query was specified, execute Lucene query to obtain (usually sorted) keys
        if (lq !== null) {
            query.lucene_query(q.client, q.db, function(luceneData) {
                if (luceneData.rows) {
                    //log('luceneData', luceneData);
                    keys = luceneData.rows.map(function(e) {
                        return e.id;
                    });
                    //log('Using ' + keys.length + ' keys coming from Lucene (out of ' + luceneData.total_rows + ')');
                    luceneTotalRows = luceneData.total_rows;
                    keysAlreadySorted = true;
                    //log('storing ldtr', luceneTotalRows);
                    // 3)
                    getRelatedTrees(keys, view);
                } else {
                    q.send_error('Lucene returned no "rows"');
                    return;
                }
            }, lq, skip, limit, false, sort);
        } else { // 2b) if no query has been specified, get keys by modi (reference modi or first col modi)
            // When does such a case happen??

            // reference module - modi of first column, if none is specified
            if (refModi === null) {
                refModi = view.$cols[0].$modi;
            }
            //log('k [' + view.$mm + ',' + refModi + ']');
            db.view('datamanager', 'by_mod', {
                key : [view.$mm, refModi],
                include_docs : false,
                reduce: false
            }, function (err, data) {
                if(err) {
                    q.send_error('err2 ' + err);
                    return;
                } else {
                    // 3)
                    var keys = data.rows.map(function(e) {
                        return e.id;
                    });
                    //log('Using ' + keys.length + ' keys coming from by_mod view');
                    getRelatedTrees(keys, view);
                    return;
                }
            });
        }
    }
}

// 3) get related docs, under trees form
// The order of "keys" determines the order of the view rows!! - except in case of manual sort,
// if parameter "keysAlreadySorted" is false (keys coming from by_mod or filter), in which case
// sorting is defined by sortDataset() below
function getRelatedTrees(keys, view) {

    // method 2: one-shot view and tree building on server - DEPRECATED
    function method2() {
        db.view('datamanager', 'related', { 
            keys: keys,
            include_docs: true,
        }, function (err, viewData) {
            if(err) {
                q.send_error('err3bis ' + err);
                return;
            } else {
                var listData =  ba.buildarbo(view.$cols, viewData.rows, false);
                // 4)
                expandDataset(listData.rows, view);
            }
        });
    }

    // method 4: parallel call to related_mod, to only get data from modis needed by the view
    //log('needs ' + viewModis.length + ' modis: ' + JSON.stringify(viewModis));
    function method4() {
        //log('METHOD 4 (distributed related_mod)');
        var megaData = [],
            nbThreads = viewModis.length,
            tasks = nbThreads,
            modi,
            modiKeys;

        for (var t=0; t < nbThreads; t++) {
            modi = viewModis[t];
            // keys for that modi
            modiKeys = keys.map(function(e) {
                return [e, modi];
            });
            var cpIdx = (t % q.clientsPool.length); // client to use among the pool
            //log('launching view on client ' + cpIdx + ' for keys of modi ' + modi);
            q.clientsPool[cpIdx].db.view('datamanager', 'related_mod', {
                keys: modiKeys,
                include_docs: true,
            }, function (err, viewData) {
                //log('a view has returned');
                if(err) {
                    q.send_error('err3ter ' + err);
                    return;
                } else {
                    // concat results - magical one-threaded javascript should ensure consistency here
                    megaData = megaData.concat(viewData.rows);
                    tasks--;
                    next();
                }
            });
        }

        function next() {
            if (tasks == 0) { // all views have returned
                // Tri par référent (key[0]), dans l'ordre des clefs retournées par Lucene
                var smallData,
                    newMegaData = [];
                for (var i=0, l = keys.length; i < l; i++) {
                    smallData = [];
                    for (var j=0, m = megaData.length; j < m; j++) {
                        if (megaData[j].key[0] == keys[i]) {
                            smallData.push(megaData[j]);
                            // optim: remove from megaData?
                        }
                    }
                    // sort by path length - mandatory although buildarbo should already take care of it... wtf?
                    smallData.sort(function(a,b) {
                        return (a.doc.$path.length > b.doc.$path.length) ? 1 : -1;
                    });
                    newMegaData = newMegaData.concat(smallData);
                }
                /*log('après tri');
                for (var i=0; i<newMegaData.length; i++) {
                   log(newMegaData[i].id);
                }*/
                var listData =  ba.buildarbo(view.$cols, newMegaData, true);
                /*log('retour de buildarbo');
                for (var i=0; i<listData.rows.length; i++) {
                    log(listData.rows[i].doc._id); // WTF++ ????
                 }*/
                // 4)
                expandDataset(listData.rows, view);
            }
        }
    }

    // Call chosen method
    method4();
}

// 4) expand the obtained dataset
function expandDataset(rows, view) {

    var dataset = [];
    // parcours de l'arbre jusqu'aux feuilles, pose de pointeurs, puis remontée
    //log('expand ' + rows.length + ' rows');
    for (var i=0; i < rows.length; i++) {
        if (group) {
            expandLineGroup(rows[i], view, dataset, null);
        } else {
            expandLine(rows[i], view, dataset, null);
        }
    }

    // unique() - only when fed by query (otherwise perf is incompatible with mean human lifetime)
    dataset = computeUnique(dataset);

    // 5a) if come from Lucene, assume they have already been sorted and paginated,
    if (keysAlreadySorted) {
        // send rows to output - end
        sendRows(dataset, luceneTotalRows, view);
    } else { // 5b) & 5c) unique, manual sort and pagination
        sortDataset(dataset);
    }
}

// recursively expands an arborescence corresponding to a row, to multiple rows
// if needed, and places it/them into "ds"
function expandLine(node, view, ds, parent) {
    // pointer to parent - @TODO could be done in buildarbo now that the data don't need to be serialized anymore
    if (parent !== null) {
        node.parent = parent;
    }
    if (commons.objectEmpty(node.sons)) {
        // feuille!
        var newLine = {};
        goUpTree(node, newLine);
        completeLine(newLine, view); // remplit les blancs
        ds.push(newLine);
    } else {
        for (var s in node.sons) {
            expandLine(node.sons[s], view, ds, node);
        }
    }
}

// recursively expands an arborescence corresponding to a row, to multiple rows
// if needed, and places it/them into "ds" - Group Version (multiple values per
// cell for docs under the reference modi)
function expandLineGroup(node, view, ds, parent) {
    // pointer to parent
    if (parent !== null) {
        node.parent = parent;
    }
    if (node.doc.$modi == refModi) {
        // modi de référence!
        var newLine = {};
        goUpTree(node, newLine); // docs higher than the reference modi, values may be repeated for each line
        goDownTree(node, newLine); // docs under the reference modi, multiple values per cell
        completeLine(newLine, view); // remplit les blancs
        ds.push(newLine);
    } else {
        //log('descend dans expandLineGroup');
        for (var s in node.sons) {
            expandLineGroup(node.sons[s], view, ds, node);
        }
    }
}

// remonte l'arbre à partir d'une feuille (mise à plat maximale)
function goUpTree(node, line) {

    var colIndex = node.doc.$modi,
        required = false;
    if (node.doc.$modi in viewColsByModi) {
        required = true;
    } else if (node.doc.$modi.substr(node.doc.$modi.lastIndexOf('.') + 1) in viewColsByModi) {
        required = true;
        colIndex = node.doc.$modi.substr(node.doc.$modi.lastIndexOf('.') + 1);
    }

    // ajout des colonnes requises par la vue - attention au cas d'une vue sur modt (query + vue)
    if (required) {
        for (var i=0; i < viewColsByModi[colIndex].length; i++) {
            var viewCol = viewColsByModi[colIndex][i];
            if (commons.is_array(viewCol.field)) { // ref on different level
                var docRef = node.doc['$ref'],
                    refVal = '';
                if (docRef && docRef[viewCol.field[1]]) {
                    refVal = (docRef[viewCol.field[1]][viewCol.field[2]] !== undefined) ? docRef[viewCol.field[1]][viewCol.field[2]] : '';
                }
                line[viewCol.order] =  refVal;
            } else { // regular field
                line[viewCol.order] = (node.doc[viewCol.field] !== undefined) ? node.doc[viewCol.field] : '';
                // referenced id?
                //log('viewCol.field', viewCol.field, 'node.doc.$ref', node.doc.$ref);
                if (line[viewCol.order] && (viewCol.type == 'ref') && node.doc.$ref && node.doc.$ref[viewCol.field]) {
                    //log('PUSHING REF ID', node.doc.$ref[viewCol.field]._id);
                    line.$ref = line.$ref || {};
                    line.$ref[viewCol.order] = node.doc.$ref[viewCol.field]._id;
                }
                // attachments?
                setAttachments(viewCol, node, line, false);
            }
        }
        // store reference modi's doc _id
        if (node.doc.$modi === refModi) {
            line.id = node.doc._id;
        }
    }

    // si on peut encore monter
    if (node.parent != null) {
        goUpTree(node.parent, line);
    }
}

// descend l'arbre à partir d'un doc du modi de référence (groupement de plusieurs valeurs par case)
// @TODO check that it works (not so sure du tout)
function goDownTree(node, line) {

    //log('- go down sur node'/*, node*/);
    var son;
    for (var s in node.sons) {
        son = node.sons[s];
        //log('- fils trouvé', son);

        var colIndex = son.doc.$modi,
            required = false;
        if (son.doc.$modi in viewColsByModi) {
            required = true;
        } else if (son.doc.$modi.substr(son.doc.$modi.lastIndexOf('.') + 1) in viewColsByModi) {
            required = true;
            colIndex = son.doc.$modi.substr(son.doc.$modi.lastIndexOf('.') + 1);
        }

        // ajout des colonnes requises par la vue
        if (required && (son.doc.$modi != node.doc.$modi)) { // wtf?
            // @TODO les racines semblent avoir comme fils elles-mêmes! Voir dans buildarbo.
            for (var i=0; i < viewColsByModi[colIndex].length; i++) {
                var viewCol = viewColsByModi[colIndex][i];
                /*log('DOWN line[' + viewCol.order + '] avant push: ', JSON.stringify(line[viewCol.order]));
                log('LINE AVANT:', line);
                log('VIEWCOL REQUISE:', viewCol);*/
                if (! (viewCol.order in line)) {
                    //log('crée une liste vide');
                    line[viewCol.order] = [];
                }
                //log('push!!');
                if (son.doc[viewCol.field]) { // @TODO comment ça peut marcher avec les arrays (voir ligne d'en dessous)??
                    if (commons.is_array(viewCol.field)) { // ref on different level
                        var docRef = son.doc['$ref'],
                            refVal = '';
                        if (docRef && docRef[viewCol.field[1]]) {
                            refVal = (docRef[viewCol.field[1]][viewCol.field[2]] !== undefined) ? docRef[viewCol.field[1]][viewCol.field[2]] : '';
                        }
                        line[viewCol.order].push(refVal);
                    } else { // regular field
                        line[viewCol.order].push(son.doc[viewCol.field]); // what about undefined ?
                        // referenced id?
                        if (line[viewCol.order] && (viewCol.type == 'ref') && son.doc.$ref && son.doc.$ref[viewCol.field]) {
                            //log('PUSHING REF ID', node.doc.$ref[viewCol.field]._id);
                            line.$ref = line.$ref || {};
                            line.$ref[viewCol.order] = son.doc.$ref[viewCol.field]._id;
                        }
                    }
                }
                // attachments ?
                setAttachments(viewCol, son, line, true);
            }
        }
        // descente
        goDownTree(son, line);
    }
}

// extrait les attachments (fichiers et urls) du doc et les place dans la ligne en
// cours, en les fusionnant dans le cas d'un affichage (colonne '_attchs') ou en
// les séparant dans le cas d'un export (colonnes '_attchs_files' et '_attchs_urls')
function setAttachments(viewCol, node, line, push) {
    if (viewCol.field == '_attchs') { // all attachments (files and urls) for display
        if (! line.$attachments) {
            line.$attachments = {};
        }
        if (node.doc._attachments || node.doc.$attachments) {
            var attchsUrls = node.doc.$attachments,
                attchsFiles = node.doc._attachments;
            if (! line.$attachments[node.doc.$modi]) {
                line.$attachments[node.doc.$modi] = [];
            }
            var mergedAttchs = {
                'data': commons.mergeObjects(attchsUrls, attchsFiles),
                'rowId': node.doc._id
            };
            if (push) { // when grouping
                line.$attachments[node.doc.$modi].push(mergedAttchs);
            } else {
                line.$attachments[node.doc.$modi] = [mergedAttchs];
            }
        }
    }
    if (viewCol.field == '_attchs_files') { // files attachments for CSV export
        if (! line[viewCol.order]) {
            line[viewCol.order] = [];
        }
        if (node.doc._attachments) {
            if (push) { // when grouping
                line[viewCol.order]/*[node.doc.$modi]*/.push(node.doc._attachments);
            } else {
                line[viewCol.order]/*[node.doc.$modi]*/ = [node.doc._attachments];
            }
        }
    }
    if (viewCol.field == '_attchs_urls') { // urls attachments for CSV export
        if (! line[viewCol.order]) {
            line[viewCol.order] = [];
        }
        if (node.doc.$attachments) {
            if (push) { // when grouping
                line[viewCol.order]/*[node.doc.$modi]*/.push(node.doc.$attachments);
            } else {
                line[viewCol.order]/*[node.doc.$modi]*/ = [node.doc.$attachments];
            }
        }
    }
}

// crée des cases vides dans la ligne pour les colonnes de la vue qu'on n'a pas
// pu récupérer dans l'arborescence des docs
function completeLine(line, view) {

    for (var i=0; i < view.$cols.length; i++) {
        if (! (i in line)) {
            line[i] = '';
        }
    }
}

// 5) sort the expanded dataset
// since everything goes through Lucene now, should not be needed anymore
function sortDataset(rows) {

    log('Performing manual sort');
    // using GLOBAL var sort

    var _idIndex = null;
    // get types for sort fields
    for (var j=0; j < sort.length; j++) {
        if (sort[j].field == '_id') {
            _idIndex = j;
        } else {
            var type = '?',
                col = -1; // easy debugging
            //log('FIELD TO SORT ON: ' + sort[j].field + ' / ' + typeof sort[j].field);
            for (var i=0; i < viewColsByModi[sort[j].modi].length; i++) {
                //log('TRY COLUMN: ' + viewColsByModi[sort[j].modi][i].field + ' / ' + typeof viewColsByModi[sort[j].modi][i].field);
                if (String(viewColsByModi[sort[j].modi][i].field) == String(sort[j].field)) {
                    type = viewColsByModi[sort[j].modi][i].type;
                    col = viewColsByModi[sort[j].modi][i].order;
                    //log('FOUND SORTING COLUMN: ' + col + ' / ' + type);
                }
            }
            sort[j].type = type;
            sort[j].col = col; // indice de la colonne pour ce critère
        }
    }

    if (_idIndex !== null) {
        sort.splice(_idIndex, 1); // cannot sort by _id when there are multiple docs per line
    }

    // sort!
    if (sort.length > 0) {
        rows.sort(sort2Rows);
    }

    // 6) then 7)
    sliceRows(rows, sendRows);
}

// Keeps only rows that have distinct values for the field defined in view.$unique
// Only applicable when the view is fed by a query
function computeUnique(rows) {

    if (! keysAlreadySorted) { // should mean "when fed by a query" - hope it's correct!
        //log('rows.length before', rows.length);
        if (indexOfUniqueCol !== null) {
            log('computing unique on', view.$unique, indexOfUniqueCol);
            rows = commons.uniqueInObject(rows, indexOfUniqueCol);
        }
        //log('rows.length after', rows.length);
    }
    return rows;
}

// recursive way to sort 2 rows on multiple columns, using "sort" global variable
function sort2Rows(a, b, critId) {

    // using GLOBAL var sort
    if (critId == undefined) critId = 0;
    var crit = sort[critId];

    if (a[crit.col] == b[crit.col]) {
        if (sort.length > (critId + 1)) { // s'il reste des critères à traiter
            return sort2Rows(a, b, critId + 1);
        } else {
            return 0; // ça ou autre chose
        }
    } else {
        return ((a[crit.col] < b[crit.col]) ? -1 : 1) * crit.order;
    }
}

// 6) return a slice between (skip) and (skip+limit)
// if keys are obtained by modi, cannot skip/limit on the original view: doing it before sorting has no meaning
function sliceRows(rows, callback) {

    var l = rows.length;

    var lskip = Math.min(skip, (l - 1));
    var llimit = Math.min(limit, (l - lskip));

    log('Slicing rows from ' + lskip + ' to ' + (lskip + llimit));
    var subrows = rows.slice(lskip, (lskip + llimit));

    // envoie le bousin, Roger!
    callback(subrows, l);
}

// Repeats the lines containing multiple attachments, in order to obtain one attachment per line
function separateAttachments(rows) {
    var newRows = [],
        attchCol = null;
    for (var c=0; c < view.$cols.length; c++) {
        if (view.$cols[c].field == '_attchs_files') { // @TODO too simple: there may be multiple ones, or _attchs_urls too
            attchCol = c;
        }
    }
    //log('ATTACH col: ' + attchCol);
    if (attchCol === null) {
        return rows;
    }
    var attchs,
        newRow;
    for (var i=0; i < rows.length; i++) {
        attchs = rows[i][attchCol];
        //log('Attachs for row ' + i);
        //log(attchs);
        if (attchs && attchs.length) {
            //log('Row ' + i + ' has ' + attchs.length + ' attachments!');
            var block;
            for (var j=0; j < attchs.length; j++) { // blocks of multiple attachments in objects
                block = attchs[j];
                // open object
                for (var b in block) {
                    newRow = JSON.parse(JSON.stringify(rows[i])); // deep copy
                    newRow[attchCol] = [{}];// only one attachment
                    newRow[attchCol][0][b] = block[b];
                    newRows.push(newRow);
                }
            }
        } else {
            newRows.push(rows[i]);
        }
    }
    return newRows;
    //rows = newRows; // clears memory occupied by old rows? Not so sure.
    //return rows;
}

// send computed view rows as JSON or CSV, depending on the "output" parameter
function sendRows(rows, totalRows) {

    if (csv) {
        if (olpa) {
            rows = separateAttachments(rows);
        }
        log('Sending CSV file');
        var headers = '';
        for (var c=0; c < view.$cols.length; c++) {
            headers += '"' + view.$cols[c].label_modi + '.' + view.$cols[c].label + '"' + separator;
        }

        //fileBuffer += headers.slice(0, -1) + '\n';
        q.send_chunk(headers.slice(0, -1) + '\n');
        var line;
        for (var i=0; i < rows.length; i++) {
            line = '';
            var type,
                field,
                col;
            for (var c=0; c < view.$cols.length; c++) {
                line += '"';
                type = view.$cols[c].type;
                field = view.$cols[c].field;
                col = rows[i][c];
                //log('ligne traitée: ' + JSON.stringify(rows[i]));
                //log('view.$cols[c]: ' + JSON.stringify(view.$cols[c]));
                //log('col: ' + JSON.stringify(col));
                // send value
                if (commons.is_array(col)) {
                    // aray with single value in it (geoloc or multi-enum)
                    if ((type == 'geoloc' || type == 'multi-enum') && col.length > 0 && (! commons.is_array(col[0]))) {
                        // treated as a regular value
                        if (type == 'geoloc') {
                            line += '[' + col + ']';
                        } else {
                            line += col;
                        }
                    } else { // array containing multiple values
                        if (field == '_attchs_files' || field == '_attchs_urls') { // separated attachments
                            var transformedCol = [],
                                attchsBlockObject;
                            for (var ci=0, cl=col.length; ci<cl; ci++) {
                                attchsBlockObject = col[ci];
                                for (var attchKey in attchsBlockObject) {
                                    transformedCol.push(attchKey);
                                }
                            }
                            col = transformedCol;
                        }
                        line += col.join('\n'); // array of grouped data, one per line
                    }
                } else { // regular field
                    if (col !== null) {
                        col = col + '';
                        line += col.replace(/"/g, '""');
                    }
                }
                line += '"' + separator;
            }
            q.send_chunk(line.slice(0, -1) + '\n');
        }
        q.end_stream();
    } else {
        log('Sending rows to output');
        q.send_json({
            rows: rows,
            nb_rows: rows.length,
            total_rows: totalRows,
            filter: openedFilter, // return opened filter for callback consistency
        });
    }
}