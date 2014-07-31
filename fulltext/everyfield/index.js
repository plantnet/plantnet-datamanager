// field name starting with $name are indexed as _name
// for mm "_design/" is removed
function(doc) {

    // data is indexed as lowercase and accent are removed
    var format_sort_value = function (s) {
        s = s || "";
        s = s.toLowerCase ? s.toLowerCase() : s;

        return s.replace(/[àâä]/gi,"a")
            .replace(/[éèêë]/gi,"e")
            .replace(/[îï]/gi,"i")
            .replace(/[ôö]/gi,"o")
            .replace(/[ùûü]/gi,"u")
            .replace(/[\+\-\&\|\!\(\)\{\}\[\]\^\"\~\*\?\\]/gi," ")
        ;
    };

    var parseDate = function(v) {
        var n,
            parts = v.split('-');
        if (parts.length != 3) return null;
        if (parts[0].length != 4) return null;
        if (parts[1].length != 2) return null;
        if (parts[2].length != 2) return null;
        n = parseNumber(parts[0]);
        if (isNaN(n)) return null;
        n = parseNumber(parts[1]);
        if (isNaN(n)) return null;
        n = parseNumber(parts[2]);
        if (isNaN(n)) return null;
        return parts.join('_');
    };

    var parseTime = function(v) {
        var n,
            parts = v.split(':');
        if (parts.length != 2 && parts.length != 3) return null;
        if (parts[0].length != 2) return null;
        if (parts[1].length != 2) return null;
        if (parts.length == 3) {
            if (parts[2].length != 2) return null;
        }
        n = parseNumber(parts[0]);
        if (isNaN(n)) return null;
        n = parseNumber(parts[1]);
        if (isNaN(n)) return null;
        if (parts.length == 3) {
            n = parseNumber(parts[2]);
            if (isNaN(n)) return null;
        }
        return parts.join('_');
    };

    // parses a string to a number if possible, only if the whole string is a number
    // (whereas parseFloat returns a number if the string *begins* with a number)
    var parseNumber = function(v) {
        var f = parseFloat(v);
        if (! isNaN(f)) {
            return Number(v);
        }
        return NaN;
    };

    // index only doc with modi
    if(!doc.$modi) {
        return null;
    }

    var ret = new Document();

    // indexes a document
    function idx(obj) {

        for (var key in obj) {

            var v = obj[key]; 
            if (v === null) { // indexation de 0, '', false
                continue;
            }

            // replace $ by _ in field name
            // $ cannot be used in query
            if(key[0] === '$') { 
                key = '_' + key.slice(1);
            }
            // remove unknown char
            key = key.replace(/\//g, ""); 

            // special fields
            switch (key) {
                case "_mm" : 
                    v = v.replace("_design/", ""); 
                    v = v.replace(/\-/g, "");
                    ret.add(v, {
                        "field" : key,
                        "type": "string",
                        "index":"not_analyzed"
                    });
                    continue;

                case "_id" :
                    // sort by id
                    ret.add(v, {
                        "field" : '_id_sort',
                        "type": "string",
                        "index":"not_analyzed"
                    });
                    // get values in _id
                    var sp = v.split("##");
                    v = [];
                    for (var i = 0; i < sp.length; i++) {
                        var tmp = sp[i].split("::");
                        if(tmp.length > 1) {
                            for(var j = 1; j < tmp.length; j++) {
                                v.push(tmp[j]);
                            }
                        }
                    }
                    break;

                case "_synonym": // do not index synonym data
                    //continue;
                    ret.add(v, {
                        "field" : key,
                        "type": "string",
                        "index":"analyzed"
                    });
                case "_rev": // do not index _rev data
                    continue;
                case "_index_tpl": // do not index _index_tpl data
                    continue;

                case "_modt":
                case "_modi":
                    ret.add(v, {
                        "field" : key,
                        "type": "string",
                        "index":"analyzed"
                    });
                    ret.add(v, { // useful? For example ".0" and "0" are considered the same... need to specify modi/modt!
                        "field" : "_mod",
                        "type": "string",
                        "index":"analyzed"
                    });
                    continue;
            }

            // regular fields
            switch (v.constructor) {
                case Function:
                    break;

                // geoloc, splitted _id, and soon multi-enum
                case Array :
                    //log.info('indexing array [' + key + '] in mm [' + obj.$mm + '], modi [' + obj.$modi + '], _id [' + obj._id + ']: ' + v);
                    //log.info('indexing array: ' + v + ' (' + key +')');
                    // geoloc?
                    if (v.length == 2 && !isNaN(parseNumber(v[0])) && !isNaN(parseNumber(v[1]))) {
                        //log.info('indexing geoloc? for [' + key + '] avec v[0] = [' + v[0] + '] et v[1] = [' + v[1] + ']');
                        var strLoc = '' + v[0] + ', ' + v[1];
                        ret.add(strLoc);
                        ret.add(v[0], {
                            "field" : key,
                            "type": "float",
                            "index":"analyzed"
                        });
                        ret.add(v[0], {
                            "field" : key + '_sort_num',
                            "type": "float",
                            "index":"not_analyzed"
                        });
                    } else {
                        // other
                        for (var i = 0; i < v.length; i++) {
                            var tmp = v[i];
                            if(tmp) { 
                                tmp = tmp.toString();
                                ret.add(tmp, {
                                    "field" : key,
                                    "type": "string",
                                    "index":"analyzed"
                                });
                                ret.add(tmp);
                            }
                        }
                    }
                    //ret.add(v.toString(), {"field" : key + "_sort", "type": "string", "index":"not_analyzed"});
                    break;

                case Number:
                    //log.info('indexing number: ' + v + ' (' + key +')');
                    ret.add(v + "");
                    ret.add(v, {
                        "field" : key,
                        "type": "float",
                        //"type": "string",
                        "index":"analyzed"
                    });
                    // numeric sort
                    ret.add(v, {
                        "field" : key + "_sort_num",
                        "type": "float",
                        //"type": "string",
                        "index":"not_analyzed"
                    });
                    // lexicographical sort
                    ret.add(format_sort_value(v + ""), {
                        "field" : key + "_sort",
                        "type": "string",
                        "index":"not_analyzed"
                    });
                    break;

                case String:
                    //log.info('indexing string: ' + v + ' (' + key +')');
                    // try to get a number
                    var num = parseNumber(v);
                    if(!isNaN(num)) {
                        //log.info('indexing string as number: ' + num + ' (' + key +')');
                        ret.add(num, { // useful?
                            "field" : key,
                            "type" : "float",
                            "index":"analyzed"
                        });
                        // numeric sort
                        ret.add(num, {
                            "field" : key + "_sort_num",
                            "type": "float",
                            "index":"not_analyzed"
                       });
                    }
                    // try to get a date
                    var date = parseDate(v);
                    if (date !== null) {
                        //log.info('indexing string as date: ' + date + ' (' + key +')');
                        //log.info('adding date : ' + v);
                        ret.add(v, { // useful?
                            "field" : key,
                            "type" : "date",
                            "index":"analyzed"
                        });
                        // date sort
                        ret.add(v, {
                            "field" : key + "_sort_date",
                            "type": "date",
                            "index":"not_analyzed"
                       });
                        v = date; // so that regular string indexation use '_' separated date (cannot query on '-')
                    }
                    // try to get a time
                    var time = parseTime(v);
                    if (time !== null) {
                        //log.info('indexing string as time: ' + time + ' (' + key +')');
                        // log.info('adding time : ' + v);
                        v = time; // so that regular string indexation use '_' separated time (cannot query on ':')
                    }
                    // regular string
                    var veq = 'œœ ' + v + ' œœ'; // DIY lucene equality - dirty - not useful for dates, but works nevertheless
                    //log.info('indexing regular string veq: ' + veq + ' (' + key +')');
                    ret.add(veq);
                    //log.info('adding [' + veq + '] to field [' + key + ']');
                    ret.add(veq, {
                        "field" : key,
                        "type": "string",
                        "index":"analyzed"
                    });
                    // original form store
                    /*ret.add(v, {
                        "field" : key,
                        "type": "string",
                        "index":"not_analyzed"
                    });*/
                    // lexicographical sort
                    ret.add(format_sort_value(v), {
                        "field" : key + "_sort",
                        "type": "string",
                        "index":"not_analyzed"
                    });
                    break;

                case Boolean:
                    //log.info('indexing boolean: ' + v + ' (' + key +')');
                    v = v + "";
                    ret.add(v);
                    ret.add(v, {
                        "field" : key,
                        "type": "string",
                        "index":"analyzed"
                    });
                    // lexicographical sort
                    ret.add(v, {
                        "field" : key + "_sort",
                        "type": "string",
                        "index":"not_analyzed"
                    });
                    break;

                case Object : 
                    //log.info('indexing object: ' + v + ' (' + key +')');
                    // index references
                    if(key === "_ref") { // index dictionary data
                        for (var rfield in doc.$ref) {
                            for (var modi_ref in doc.$ref[rfield]) {
                                var rv = doc.$ref[rfield][modi_ref];
                                if(!rv || modi_ref === 'geoloc') {
                                    continue;
                                }
                                // index referenced data in a field that includes the target dictionary's module
                                // (allows to restrain target dataset in queries criteria)
                                var rk = ["_ref", rfield, modi_ref].join("").replace(/\./g, "");
                                ret.add(rv, {
                                    "field" : rk,
                                    "type": "string",
                                    "index":"analyzed"
                                });
                                ret.add(rv);
                                rv = rv.toLowerCase ? rv.toLowerCase() : rv;
                                ret.add(rv, {
                                    "field" : rk + "_sort",
                                    "type": "string", 
                                    "index":"not_analyzed"
                                });
                            }
                        }
                    } else { // index $meta, and... ?
                        //log.info('Recursive CALL');
                        idx(v); // recursive call
                    }
                    break;
            }
        }
    };

    // main
    try {
        idx(doc);
    } catch (x) {
        log.info("Exception during indexing : " + x);
    }

    // index attachments
    if (doc._attachments) {
        for (var i in doc._attachments) {
            //ret.attachment("default", i);
            ret.add(i);
            ret.add(i, {
                "field" : "_attchs",
                "type": "string",
                "index":"analyzed"
            });
            ret.add(i, {
                "field" : "_attchs_sort",
                "type": "string",
                "index":"not_analyzed"
            });
        }
    }
    if (doc.$attachments) {
        for (var i in doc.$attachments) {
            ret.add(i);
            ret.add(i, {
                "field" : "_attchs",
                "type": "string",
                "index":"analyzed"
            });
            ret.add(i, {
                "field" : "_attchs_sort",
                "type": "string",
                "index":"not_analyzed"
            });
        }
    }

    return ret;
}