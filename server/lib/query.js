// partial copy (almost complete) of client-side libQuery - beware of cracra redundancy

var commons = require('commons');

var _get_lucene_type = function (dmtype) {
    switch (dmtype)  {
        case 'integer': 
        case 'float':
        case 'range':
        case 'geoloc':
            return '<float>'; 
        default : return '';
    }
};

var _get_lucene_sort_field = function (dmtype) {
    switch (dmtype)  {
        case 'integer': 
        case 'float':
        case 'range':
        case 'geoloc':
            return '_sort_num'; 
        default : return '_sort';
    }
};

var _remove_chars = function (f) {
    f = f.replace(/\//g, "");
    f = f.replace(/\./g, "");
    f = f.replace(/\,/g, "");
    return f;
};

// run a lucene query
// q is an object describing query by field
exports.lucene_query = function (client, db, callback, q, skip, limit, include_docs, sort_params) {

    var q_str = "";
    if (! sort_params) {
        sort_params = [];
    }

    // builds a Lucene search clause for multi-enum fields,
    // with OR operators between each other
    var buildOrSubclause = function(f, qe) {

        var subClause = '',
            sqe,
            sc;
        if (qe.value.length == 0) {
            return null;
        }

        if (qe.value.length == 1) {
            qe.value = qe.value[0];
            subClause = buildClause(f, qe);
        } else {
            for (var i=0, l=qe.value.length; i < l; i++) {
                sqe = JSON.parse(JSON.stringify(qe));
                sqe.value = qe.value[i];
                sc = buildClause(f, sqe);
                if (subClause == '') {
                    subClause += '(' + sc;
                } else {
                    subClause += ' OR ' + sc;
                }
            }
            subClause += ')';
        }
        //$.log('sub clause returned', subClause);
        return subClause;
    }

    // builds a Lucene search clause based on the field type and the operator
    // could certainly be optimized, so many IFs!!!
    var buildClause = function(f, qe) {
        var op = qe.op,
            type = qe.type,
            cl = '',
            nf = f,
            th = '',
            neg = '',
            v = '??'; // facilitates debugging
        // double-quotes (or not) the value depending on type and operator
        // sanitizes the value, too (replaces ':' and '-' by '_' or ' ')
        var quoteValue = function(v) {
            switch (type) {
                case 'date':
                    if (op == 'startswith' && op == 'equals') {
                        v = v.replace('-', '_');
                    } else {
                        v = '"' + v + '"';
                    }
                    break;
                case 'time':
                    // no quoting at all
                    v = v.replace(':', '_');
                    break;
                case 'geoloc':
                    if (op != 'startswith') {
                        v = '"' + v + '"';
                    }
                    break;
                case 'integer':
                case 'float':
                case 'range':
                    // no sanitizing at all (would break negatives)
                    v = '"' + v + '"';
                    break;
                default:
                    v = v.replace(':', '_').replace('-', ' '); // ':' and '-' are forbidden in a query, except for typed fields
                    // if term ends by *, do not quote because of Batman side effect (breaks the joker)
                    if (v[v.length-1] != '*') {
                        v = '"' + v + '"';
                    }
            }
            return v;
        };
        // complex param
         if (typeof (qe) === "object") { // always the case, except '$mm' and '$mod'

             if (op[0] == '-') {
                 op = op.slice(1);
                 neg = '-';
             }
            // type hint? depends on the type and the operator
            switch (type) {
                case 'date':
                    if ((op == 'lower') || (op == 'greater') || (op == 'notempty') || (op == 'range')) {
                        th = '<date>';
                    }
                    break;
                case 'integer':
                case 'float':
                case 'range':
                    if ((op == 'lower') || (op == 'greater') || (op == 'notempty') || (op == 'range') || (op == 'equals')) {
                        th = '<float>';
                    }
                    break;
                case 'geoloc':
                    if ((op == 'lower') || (op == 'greater') || (op == 'range')) {
                        th = '<float>';
                    }
                    break;
                case 'ref':
                    if (commons.is_array(qe.field)) {
                        nf = '_ref' + qe.field[1] + qe.field[2];
                        nf.replace(/\./g, '');
                    }
                    break;
                default:
            }
            // "extreme" boundaries (de LIDL)
            var low = '',
                great = 'zzz';
            if (type == 'date') {
                low = '0000-00-00';
                great = '9999-12-31';
            } else if (type == 'time') {
                low = '0';
                great = '24';
            } else if (type == 'integer' || type == 'range' || type == 'float') {
                low = '-1.0E20';
                great = '1.0E20';
            } else if (type == 'geoloc') {
                low = '-200';
                great = '200';
            }
            // clause formulation depending on operator and type
            switch (op) {
                case 'range':
                    // @TODO manage geoloc (test longitude only)
                    v = '[' + quoteValue(qe.min) + ' TO ' + quoteValue(qe.max) + ']';
                    break;
                case 'lower':
                    // @TODO manage geoloc (test longitude only)
                    v = '[' + quoteValue(low) + ' TO ' + quoteValue(qe.value) + ']';
                    break;
                case 'greater':
                    // @TODO manage geoloc (test longitude only)
                    v = '[' + quoteValue(qe.value) + ' TO ' + quoteValue(great) + ']';
                    break;
                case 'notempty':
                    v = '[' + quoteValue(low) + ' TO ' + quoteValue(great) + ']';
                    break;
                case 'equals':
                    if (type == 'text' || type == 'longtext' || type == 'url' || type == 'ref') {
                        v = quoteValue('œœ ' + qe.value + ' œœ');
                    } else {
                        v = quoteValue(qe.value);
                    }
                    break;
                case 'startswith':
                    if (type == 'date' || type == 'time' || type == 'geoloc') {
                        v = quoteValue(qe.value + '*');
                    } else { // "text" assimilated types
                        v = quoteValue('œœ ' + qe.value);
                    }
                    break;
                case 'endswith':
                    v = quoteValue(qe.value + ' œœ'); // not applicable to types other than "text" and assimilated
                    break;
                case 'contains':
                default:
                    v = quoteValue(qe.value, type, op);
            }
        } else {
        // normalize field name
            if(nf[0] == "$") { // convert leading $ to _
                nf = "_" + nf.slice(1);
                v = qe;
                if(nf == "_mm") {
                    v = v.replace("_design/", "");
                    v = v.replace(/\-/g, "");
                }
            } else if (nf[0] == '_') { // simple criterion on _modi or _modt, coming from libView
                v = qe;
            }
            
        }
        nf = _remove_chars(nf);
        cl += neg + nf + th + ':' + v;
        cl = cl.trim();

        return cl;
    };

    for (var field in q) {
        var qf = q[field];
        if (! commons.is_array(qf)) {
            qf = [qf];
        }
        // multiple clauses on each field
        for (var i=0; i < qf.length; i++) {
            //$.log('launching buildClause on', field, qf[i]);
            var v;
            if (commons.is_array(qf[i].value)) {
                v = buildOrSubclause(field, qf[i]);
            } else {
                v = buildClause(field, qf[i]);
            }
            if (v) {
                if(q_str.length) {
                    q_str += encodeURI(" AND ");
                }
                //$.log('clause', v);
                v = v.replace(/&/g, ''); // & character is not encoded so it ruins everything - results are acceptable like that
                q_str += encodeURI(v);
            }
        }
    }

    var url = "/_fti/local/" + db.name + "/_design/datamanager/everyfield"
        + "?q=" + q_str;
    if (skip !== null) {
        url += "&skip=" + skip;
    }
    if (limit !== null) {
        url += "&limit=" + limit;
    }

    if(include_docs) {
        url += "&include_docs=true";
    }

    // multiple columns sort
    if (sort_params.length > 0) {
        url += "&sort=";
    }
    for (var i=0; i < sort_params.length; i++) {
        var sp = sort_params[i];
        var stype = _get_lucene_type(sp.type),
            lucene_field = _get_lucene_sort_field(sp.type);
        var sorder = (sp.order < 0) ? "\\" : "/",
            sfield = sp.field;
        if (Object.prototype.toString.call(sfield) === '[object Array]') { // is_array
            sfield = '_ref' + sfield[1] + sfield[2];
            sfield.replace(/\./g, '');
        }
        sfield = _remove_chars(sfield);
        sfield += lucene_field;
        if(sfield[0] == "$") {
            sfield = "_" + sfield.slice(1);
        }
        url += sorder + encodeURIComponent(sfield) + stype;
        if (i < (sort_params.length - 1)) {
            url += ',';
        }
    }

    // balance tout bibiche
    //log('Lucene URL:' + url);
    // call lucene
    client.request({
        path: url
    }, function(err, luceneData) {
        if (err) {
            log('Query execution error: ' + err);
        } else {
            //log('Lucene Data Retrieved: ' + JSON.stringify(luceneData));
            callback(luceneData);
        }
    });
};

//run a lucene query string against /fti handler, and return ids list of matching rows
exports.direct_lucene_query = function(client, db, q, onSuccess, onError, limit, staleOk) {

  limit = limit || 999999;

  var url = '/_fti/local/' + db.name
      + '/_design/datamanager/everyfield?q=' + encodeURIComponent(q)
      + (staleOk === true ? '&stale=ok' : '')
      + '&default_operator=AND'
      + '&limit=' + limit;

  client.request({
      path: url
  }, function(err, result) {
      if (err) {
          log('Query execution error: ' + err);
          onError(err);
      } else {
          var ids = result.rows.map(function (r) {
              return r.id;
          });
          onSuccess(ids);
      }
  });
};

// executes a complex query (multiple criteria)
exports.query = function(client, db, query, onSuccess, onError, alreadyTreated) {

    var result,
        mm_id = query.$mm,
        nb_req = 0,
        cache = JSON.stringify(new Date().getTime());
    // detects loop in recursive calls
    if (alreadyTreated == undefined) {
        alreadyTreated = {};
        alreadyTreated[query._id] = true;
    }

    // intersects results of all queries as they call back
    // (sub-queries per module, and xmm queries)
    function intersectResults(ids) {
        // combine results
        if (!result) {
            result = ids;
        } else {
            result = exports._and(result, ids);
        }
        nb_req--;
        if (nb_req == 0) {
            //$.log('all requests processed! calling back');
            onSuccess(result);
        }
    }

    // processes the result of a cross-structure query for one "ref" field, and
    // computes the intersection with the existing results (given by the query
    // on the local structure)
    function process_xmm(xmm) {
        //$.log('processing xmm', 'from mod', query.$select, 'to mod', xmm.mod, xmm);
        // open remote query doc
        db.getDoc(xmm.qid, function(err, remoteQuery) {
            if (err) {
                onError(err);
                return false;
            }
            if (remoteQuery._id in alreadyTreated) {
                onError('Loop in subqueries');
            } else {
                alreadyTreated[remoteQuery._id] = true;
            }
            //$.log('opened remote query doc', remoteQuery);
            // run query on target structure - recursive call
            exports.query(client, db, remoteQuery, function(remoteIds) {
                //$.log('successfully ran remote query', remoteIds);
                // call refs_by_referent view to match remote ids with local docs pointing at them
                var keys = remoteIds.map(function(e) {
                    return [xmm.mm, xmm.mod, xmm.field, e];
                });
                db.view('datamanager', 'refs_by_referent', {
                        keys: keys,
                        cache: cache
                    }, function(err, data) {
                        if (err) {
                            onError(err);
                            return false;
                        }
                        var referringIds = [];
                        if (data.rows && data.rows.length) {
                            referringIds = data.rows.map(function(e) {
                                return e.id;
                            });
                        }
                        // si le critère est sur un module différent de celui
                        // sur lequel on sélectionne / intersecte
                        //$.log('referring ids received', referringIds);
                        if (query.$select != xmm.mod) {
                            //$.log('calling related_mod because of different modules');
                            var referringKeys = referringIds.map(function(e) {
                                return [e, query.$select];
                            });
                            db.view('datamanager', 'related_mod', {
                                    keys: referringKeys,
                                    cache: cache
                                }, function(err, related) {
                                    if (err) {
                                        onError(err);
                                        return false;
                                    }
                                    var relatedReferringIds = [];
                                    if (related.rows && related.rows.length) {
                                        relatedReferringIds = related.rows.map(function(e) {
                                            return e.value._id;
                                        });
                                        relatedReferringIds = commons.unique(relatedReferringIds); // useful?
                                    }
                                    intersectResults(relatedReferringIds);
                                }
                            );
                        } else {
                            //$.log('same module!');
                            intersectResults(referringIds);
                        }
                });
            }, onError, alreadyTreated); // specify already treated queries to avoid loops
        });
    }

    // processes the result of a Lucene query on a module, and computes the
    // intersection with the existing results (given by other mod-queries)
    function process_q(data) {
        // get ids for query.$select 
        var keys = [];
        if (data.rows) {
            for (i = 0, l = data.rows.length; i < l; i++) {
                var id = data.rows[i].id;
                keys.push([id, query.$select]); 
            }
            // target modt
            var target_modt = query.$select;
            if (target_modt[0] == '.') {
                target_modt = target_modt.split('.');
                target_modt = target_modt[target_modt.length - 1]; // .last() doesn't work ..
            }

            db.view('datamanager', 'related_mod', {
                cache: cache,
                keys: keys,
            }, function (err, related) {
                if(err) {
                    q.send_error('err 472 ' + err);
                    return;
                } else {
                    var ids = [];
                    var i, l;
                    for (i = 0, l = related.rows.length; i < l; i++) {
                        var id = related.rows[i].value._id;
                        // @TODO if related doc's modt is the same as target modt, exclude it (case of modt under itself)
                        //$.log ('related modt', rmodt, rmodi, 'target modt', target_modt);
                        ids.push(id);
                    }
                    ids = commons.unique(ids);
                    intersectResults(ids);
                }
            });
        }
    }
    
    function process_q_bro(data) {
        // get ids for query.$select 
        var keys = [];
        var returned_ids = [];
        if (data.rows) {
            for (i = 0, l = data.rows.length; i < l; i++) {
                var id = data.rows[i].id;
                keys.push([id, query.$select]);
                returned_ids.push(id);
            }
            // target modt
            var target_modt = query.$select;
            if (target_modt[0] == '.') {
                target_modt = target_modt.split('.');
                target_modt = target_modt[target_modt.length - 1]; // .last() doesn't work ..
            }

            db.view('datamanager', 'related_mod', {
                cache: cache,
                keys: keys,
            }, function (err, related) {
                if (err) {
                    q.send_error('err 472 ' + err);
                    return;
                } else {
                    var ids = [];
                    var i, l;
                    for (i = 0, l = related.rows.length; i < l; i++) {
                        var id = related.rows[i].value._id;
                        // @TODO if related doc's modt is the same as target modt, exclude it (case of modt under itself)
                        //$.log ('related modt', rmodt, rmodi, 'target modt', target_modt);
                        ids.push(id);
                    }

                    // get path for returned ids to get their parents (to get their brothers)
                    db.view('datamanager', 'path', {
                        cache: cache,
                        keys: returned_ids,
                    }, function (err, paths) {
                        if (err) {
                            ids = commons.unique(ids);
                            intersectResults(ids);
                            return;
                        } else {
                            var parents_keys = [];
                            if (paths.rows && paths.rows.length > 0) {
                                for (i = 0, l = paths.rows.length; i < l; i++) {
                                    var path = paths.rows[i].value.path;
                                    if (path.length > 0) {
                                        parents_keys.push([path[(path.length - 1)], query.$select]);
                                    }
                                }
                            }

                            if (parents_keys.length > 0) {
                                // get brothers' ids
                                db.view('datamanager', 'related_mod_bis', {
                                    cache: cache,
                                    keys: parents_keys,
                                }, function (err, brothers) {
                                    if (err) {
                                        ids = commons.unique(ids);
                                        intersectResults(ids);
                                        return;
                                    } else {
                                        if (brothers.rows && brothers.rows.length > 0) {
                                            for (i = 0, l = brothers.rows.length; i < l; i++) {
                                                var id = brothers.rows[i].value._id;
                                                ids.push(id);
                                            }
                                        }
                                        ids = commons.unique(ids);
                                        intersectResults(ids);
                                    }
                                });
                            } else {
                                ids = commons.unique(ids);
                                intersectResults(ids);
                            }
                        }
                    });
                }
            });
        }
    }

    // build query obj
    var q_by_mod = {},
        xmms = [];
    if(!query.$criteria.length) {
        log('Error in query.query(): Nothing to search');
    }

    var query_mod = query.$select;

    for (var i = 0, l = query.$criteria.length; i < l; i++) {
        var crit = query.$criteria[i],
        mod = crit.$mod || crit.$modi; // ensure compatibility

        // separate xmm criteria from regular ones (on the current structure)
        if (crit.op == 'xmm') {
            nb_req++;
            xmms.push({
                mm: mm_id,
                qid: crit.value,
                mod: mod,
                field: crit.field
            });
        } else {
            if(!q_by_mod[mod]) {
                nb_req++;
                q_by_mod[mod] = {
                    "$mm" : mm_id
                };
                if (mod[0] == '.') { // specify key "modt" or "modi", needed for Lucene
                    q_by_mod[mod].$modi = mod;
                } else {
                    q_by_mod[mod].$modt = mod;
                }
            }
            // multiple clauses are possible on each field
            if (! q_by_mod[mod][crit.field]) {
                q_by_mod[mod][crit.field] = [];
            }
            q_by_mod[mod][crit.field].push(crit);
            // single clause per field
            //q_by_mod[mod][crit.field] = crit;
        }
    }

    for (var i=0; i < xmms.length; i++) {
        // run XMM query!!
        process_xmm(xmms[i]);
    }

    for (var qmod in q_by_mod) {
        var simple_query = true;
        if (query_mod.indexOf('.')!==-1 && qmod.indexOf('.')!==-1) {
            if (query_mod.substring(0, query_mod.length - 1) == qmod.substring(0, qmod.length - 1)) {
                if (query_mod.slice(-1) != qmod.slice(-1)) {
                    simple_query = false;
                }
            }
        }
        if (simple_query) {
            exports.lucene_query(client, db, process_q, q_by_mod[qmod], 0, 999999);
        } else {
            exports.lucene_query(client, db, process_q_bro, q_by_mod[qmod], 0, 999999);
        }
    }
};

// returns the elements present in ids and in sorted_ids, in the order of sorted_ids
exports._and = function (ids, sorted_ids) {
    //$.log('and...', ids.length, sorted_ids.length);
    var res = [],
        index = {},
        i,
        l;

    for (i = 0, l = ids.length; i < l; i++) {
        index[ids[i]] = 1;
    }
    for (i = 0, l = sorted_ids.length; i < l; i++) {
        var id = sorted_ids[i];
        if (index[id]) {
            res.push(id);
        }
        // TODO tester la longueur de res p/r à index et/ou sorted_ids, et
        // arrêter de pusher si on a déjà le nombre max de lignes
    }
    return res;
};

// executes a Lucene query on the mm_id and the sort_mod, sorts it according to sort_params,
// then sorts the given ids in the order of the said query
exports.sort_selection = function (client, db, ids, mm_id, sort_mod, isView, sort_params, onSuccess) {

    //$.log('sort_selection', ids.length, isView);
    var cache = JSON.stringify(new Date().getTime());

    var modt = sort_mod.split('.');
    modt = modt[modt.length - 1]; // last() doesn't work here

    // computes an "AND" between sorted keys of the whole mod(t|i) and the query (selection) results
    var process_q = function (data) {
        var sorted_ids = data.rows.map(function (e) {
            return e.id;
        });
        sorted_ids = commons.unique(sorted_ids);
        var keys = [],
            i,
            l;
        for (i = 0, l = ids.length; i < l; i++) {
            keys.push([ids[i], sort_mod]);
        }
        //$.log('new keys', keys.length);

        // for views, when sorting on related doc field // wtf?
        if (isView) {
            // @TODO if the sort criterion (there should be only one at this time!)
            // is not on the query's modi/modt, call manual sort
        } else { // for mm only (no related docs) */
            ids = exports._and(ids, sorted_ids);
            onSuccess(ids);
        }
    };

    // get doc sorted
    var q = {
        $mm : mm_id
    }; 
    if (sort_mod[0] == '.') { // specify key "modt" or "modi", needed for Lucene
        q.$modi = sort_mod;
    } else {
        q.$modt = sort_mod;
    }

    exports.lucene_query(client, db, process_q, q, 0, 999999, false, sort_params);
};