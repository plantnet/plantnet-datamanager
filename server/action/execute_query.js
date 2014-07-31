/*
Web service : execute Lucene query (get list of ids)

URL :  server/_dm/db/execute_query
Params:
    - id: the query id
*/

var query = require('query');

function getQueryResult(db, id) {

    db.getDoc(id, function (err, doc) {
        if(err) {
            q.send_error(err);
            return;
        }

        // call Lucene
        query.query(q.client, db, doc, function(ids) {
            q.send_json({
                ids: ids
            });
        });
    });
}

//service description
if (q.method == 'OPTIONS') {
    var acceptedMethods = 'GET, POST';
    q.send_options({
        method: 'execute_query',
        accepted: acceptedMethods,
        description: 'get a GeoJSON "FeatureCollection" document based on the "_spatial/points" view, for a given structure',
        params: {
            id: {
                type: 'string',
                description: 'id of the query document to execute',
                mandatory: true
            }
        }
    }, acceptedMethods);
} else {
    getQueryResult(q.db, q.params.id);
}