var Cache = require("vendor/datamanager/lib/cache");
var Utils = require("vendor/datamanager/lib/utils");

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
exports.lucene_query = function (db, callback, q, skip, limit, include_docs, sort_params) {

    var q_str = '';
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
                sqe = JSON.parse(JSON.stringify(qe)); // deep copy
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
        return subClause;
    }

    // builds a Lucene search clause based on the field type and the operator
    // could certainly be optimized, so many IFs!!!
    var buildClause = function(f, qe) {
        var op = qe.op,
            type = qe.type,
            cl = '', // clause
            nf = f, // normalized field name
            th = '', // type hint
            neg = '', // negative (-)
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
                    if (Utils.is_array(qe.field)) { // ref on another level of dictionary
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
        if (! Utils.is_array(qf)) {
            qf = [qf];
        }
        // multiple clauses on each field
        for (var i=0; i < qf.length; i++) {
            var v;
            if (Utils.is_array(qf[i].value)) {
                v = buildOrSubclause(field, qf[i]);
            } else {
                v = buildClause(field, qf[i]);
            }
            if (v) {
                if(q_str.length) {
                    q_str += encodeURI(" AND ");
                }
                v = v.replace(/&/g, ''); // & character is not encoded so it ruins everything - results are acceptable like that
                q_str += encodeURI(v);
            }
        }
    }

    var url = "/_fti/local/" + db.name + "/_design/datamanager/everyfield"
        + "?q=" + q_str
        + "&skip=" + skip 
        + "&limit=" + limit;

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
    //$.log(url);
    $.ajax({
        url: url,
        dataType: 'json',
        success: function (data) {
            callback(data);
        },
        error: function(e) {
            $.log('Query execution error', e);
        }
    });
};

exports.getDocs = function (db, q, skip, limit, success, error) {

    var tmp_q = q.split(' OR ');
    for (var i = 0; i < tmp_q.length; i++) {
        tmp_tmp_q = tmp_q[i].split(' AND ');
        for(var j = 0; j < tmp_tmp_q.length; j++) {
            tmp_tmp_q[j] = tmp_tmp_q[j].toLowerCase();
        }
        tmp_q[i] = tmp_tmp_q.join(' AND ');
    }
    q = tmp_q.join(' OR ').trim();

    var url = "/_fti/local/" + db.name + 
        "/_design/datamanager/everyfield?q="+ encodeURIComponent(q)
        + "&include_docs=true" 
        + "&skip=" + skip 
        //+ "&stale=ok"
        + "&default_operator=AND"
        + "&limit=" + limit;
    
    $.ajax({
        url: url,
        dataType: 'json',
        success: success,
        error : error
    });
};


// get ids to show, base on query 'q'
// on success  call success(ids)
exports.getIds = function (db, q, success, error, limit, mm_id) {

    limit = limit || 10000000;
    q = q.trim().toLowerCase();

    if(mm_id) {
        mm_id = mm_id.replace("_design/", "").replace(/\-/g, "");
        q += " _mm:" + mm_id;
    }

    var url = "/_fti/local/" + db.name + 
        "/_design/datamanager/everyfield?q=" + encodeURIComponent(q)
        //+ "&stale=ok"
        + "&default_operator=AND"
        + "&limit=" + limit;

    $.ajax({
       url: url,
       dataType: 'json',
       success: function(result) {
           var ids = [];
           if (Utils.is_array(result)) { // search with "," leads to multiple result sets
               for (var i=0; i<result.length; i++) {
                   var tmpIds = result[i].rows.map(function (r) { return r.id; });
                   ids = ids.concat(tmpIds);
               }
               ids = ids.unique();
           } else {
               ids = result.rows.map(function (r) { return r.id; });
           }
           success(ids); 
       },
       error : error
   });
};

//run a lucene query string against /fti handler, and return ids list of matching rows
exports.direct_lucene_query = function(db, q, onSuccess, onError, limit, staleOk) {

    limit = limit || 999999;

    var url = '/_fti/local/' + db.name
        + '/_design/datamanager/everyfield?q=' + encodeURIComponent(q)
        + (staleOk === true ? '&stale=ok' : '')
        + '&default_operator=AND'
        + '&limit=' + limit;

    $.ajax({
        url: url,
        dataType: 'json',
        success: function(result) {
            var ids = result.rows.map(function (r) {
                return r.id;
            });
            onSuccess(ids); 
        },
        error : onError
    });
};

exports.triggerLuceneIndex = function(db) {
    var url = "/_fti/local/" + db.name + "/_design/datamanager/everyfield?q=" + "a"
        + "&stale=ok"
        + "&limit=" + 1;

    $.ajax({
       url: url,
       dataType: 'json'
   });

};

// execute query
exports.query = function(db, query, onSuccess, onError, alreadyTreated) {

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
        db.openDoc(xmm.qid, {
            success: function(remoteQuery) {
                if (remoteQuery._id in alreadyTreated) {
                    onError('Loop in subqueries');
                } else {
                    alreadyTreated[remoteQuery._id] = true;
                }
                //$.log('opened remote query doc', remoteQuery);
                // run query on target structure - recursive call
                exports.query(db, remoteQuery, function(remoteIds) {
                    //$.log('successfully ran remote query', remoteIds);
                    // call refs_by_referent view to match remote ids with local docs pointing at them
                    var keys = remoteIds.map(function(e) {
                        return [xmm.mm, xmm.mod, xmm.field, e];
                    });
                    db.view('datamanager/refs_by_referent', {
                        keys: keys,
                        cache: cache,
                        success: function(data) {
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
                                db.view('datamanager/related_mod', {
                                    keys: referringKeys,
                                    cache: cache,
                                    success: function(related) {
                                        var relatedReferringIds = [];
                                        if (related.rows && related.rows.length) {
                                            relatedReferringIds = related.rows.map(function(e) {
                                                return e.value._id;
                                            });
                                            relatedReferringIds = relatedReferringIds.unique(); // useful?
                                        }
                                        intersectResults(relatedReferringIds);
                                    },
                                    error: onError
                                });
                            } else {
                                //$.log('same module!');
                                intersectResults(referringIds);
                            }
                        },
                        error: onError
                    });
                }, onError, alreadyTreated); // specify already treated queries to avoid loops
            },
            error: onError
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
                target_modt = target_modt.split('.').last();
            }

            db.view("datamanager/related_mod", {
                cache : cache,
                keys : keys,
                success : function (related) {
                    var ids = [];
                    var i, l;
                    for (i = 0, l = related.rows.length; i < l; i++) {
                        var id = related.rows[i].value._id;
                        // @TODO if related doc's modt is the same as target modt, exclude it (case of modt under itself)
                        //$.log ('related modt', rmodt, rmodi, 'target modt', target_modt);
                        ids.push(id);
                    } 
                    ids = ids.unique();

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
            //$.log('received keys', keys.length);
            // target modt
            var target_modt = query.$select;
            if (target_modt[0] == '.') {
                target_modt = target_modt.split('.').last();
            }

            db.view("datamanager/related_mod", {
                cache : cache,
                keys : keys,
                success : function (related) {
                    var ids = [];
                    var i, l;
                    for (i = 0, l = related.rows.length; i < l; i++) {
                        var id = related.rows[i].value._id;
                        // @TODO if related doc's modt is the same as target modt, exclude it (case of modt under itself)
                        //$.log ('related modt', rmodt, rmodi, 'target modt', target_modt);
                        ids.push(id);
                    }

                    // get path for returned ids to get their parents (to get their brothers)
                    db.view("datamanager/path", {
                        cache : cache,
                        keys : returned_ids,
                        success : function (paths) {
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
                                db.view("datamanager/related_mod_bis", {
                                    cache : cache,
                                    keys : parents_keys,
                                    success : function (brothers) {
                                        if (brothers.rows && brothers.rows.length > 0) {
                                            for (i = 0, l = brothers.rows.length; i < l; i++) {
                                                var id = brothers.rows[i].value._id;
                                                ids.push(id);
                                            }
                                        }
                                        ids = ids.unique();
                                        intersectResults(ids);
                                    },
                                    error : function () {
                                        ids = ids.unique();
                                        intersectResults(ids);
                                    }
                                });
                            } else {
                                ids = ids.unique();
                                intersectResults(ids);
                            }
                        },
                        error : function () {
                            ids = ids.unique();
                            intersectResults(ids);
                        }
                    });
                }
            });
        }
    }

    // build query obj by module, and execute one Lucene query per module
    var q_by_mod = {},
        xmms = [];
    if(!query.$criteria.length) {
        onError("Nothing to search");
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
        }
    }

    for (var i=0; i < xmms.length; i++) {
        // run XMM query!!
        process_xmm(xmms[i]);
    }

    //$.log('q by mod', q_by_mod);
    for (var qmod in q_by_mod) {
        //$.log('regular query to run', qmod, q_by_mod[qmod]);

        var simple_query = true;
        if (query_mod.indexOf('.')!==-1 && qmod.indexOf('.')!==-1) {
            if (query_mod.substring(0, query_mod.length - 1) == qmod.substring(0, qmod.length - 1)) {
                if (query_mod.slice(-1) != qmod.slice(-1)) {
                    simple_query = false;
                }
            }
        }

        if (simple_query) {
            exports.lucene_query(db, process_q, q_by_mod[qmod], 0, 999999);
        } else {
            exports.lucene_query(db, process_q_bro, q_by_mod[qmod], 0, 999999);
        }
    }
};


// return element present in ids and sorted_ids in the order of sorted_ids
exports._and = function (ids, sorted_ids) {
    //$.log('and...', ids.length, sorted_ids.length);
    var res = [];
    var index = {};
    var i, l;
    for (i = 0, l = ids.length; i < l; i++) {
        index[ids[i]] = 1;
    }
    for (i = 0, l = sorted_ids.length; i < l; i++) {
        var id = sorted_ids[i];
        if (index[id]) { res.push(id); }
        // TODO tester la longueur de res p/r à index et/ou sorted_ids, et
        // arrêter de pusher si on a déjà le nombre max de lignes
    }
    return res;
};


exports._or = function (ids1, ids2) {
    return ids1.concat(ids2).unique();
};


// sort ids by sort_mod.field
// sort_mod can be a modi or a modt
// call onSuccess(sorted_ids)
exports.sort_selection = function (app, ids, mm_id, sort_mod, isView, sort_params, onSuccess) {

    //$.log('sort_selection', ids.length, isView);
    var cache = JSON.stringify(new Date().getTime()),
        modt = sort_mod.split('.').last();

    // computes an "AND" between sorted keys of the whole mod(t|i) and the query (selection) results
    var process_q = function (data) {
        var sorted_ids = data.rows.map(function (e) {
            return e.id;
        }).unique();
        var keys = [],
            i,
            l;
        for (i = 0, l = ids.length; i < l; i++) {
            keys.push([ids[i], sort_mod]);
        }
        //$.log('new keys', keys.length);

        // for views, when sorting on related doc field
        if (isView) {
            app.db.view("datamanager/related_mod", {
                cache : cache,
                keys : keys,
                success : function (related) {
                    keys = related.rows.map(function (e) {
                        return e.value._id;
                    });
                    keys = keys.unique();
                    // sorted _and
                    ids = exports._and(keys, sorted_ids);
                    onSuccess(ids);
                }
            });
        } else { // for mm only (no related docs)
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

    // get types for sort fields
    for (var j=0; j < sort_params.length; j++) {
        sort_params[j].type = Cache.get_field_type(app, mm_id, modt, sort_params[j].field);
    }

    exports.lucene_query(app.db, process_q, q, 0, 999999, false, sort_params);
};