function(doc, req) {

    try {

    var parse = req.query.parse,
        parsedParam = req.query;

    //log(['req', req]);

    if (parse) {
        //log('JE PARSE!!');
        parsedParam = JSON.parse(req.query.singleParam);
    }

    var filter_ids = parsedParam.ids,
        filter_structures = parsedParam.structures,
        filter_types = parsedParam.types;

    /*log(['parse', typeof parse, parse]);
    log(['filter_ids', typeof filter_ids, filter_ids]);
    log(['filter_structures', typeof filter_structures, filter_structures]);
    log(['filter_types', typeof filter_types, filter_types]);*/

    if (filter_ids && (doc._id in filter_ids)) { // structures design docs or individual ids (regular docs, selections)
        return true;
    }
    if (filter_structures && doc.$mm && (doc.$mm in filter_structures)) {
        if (doc.$type) { // view or query definition
            if (doc.$type in filter_structures[doc.$mm]) {
                return true;
            }
        } else { // regular data doc in structure
            if ('data' in filter_structures[doc.$mm]) {
                return true;
            }
        }
    }
    if (filter_types && doc.$type (doc.$type in filter_types)) { // all queries, views, selections...
        return true;
    }

    return false;

    } catch (e) {
        log(['filter failure', e]);
        return false;
    }
}