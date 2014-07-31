/*
Web service : get a GeoJSON "FeatureCollection" document based on the
"_spatial/points" view, for a given structure

URL :  server/_dm/db/get_features
Params:
    - id: structure id (without '_design/')
*/

function getFeatures(db, id) {

    var featureCollection = {
        type: 'FeatureCollection',
        features: []
    };

    if (id.substr(0,8) == '_design/') {
        id = id.slice(8);
    }

    q.client.request({
        method: 'GET',
        path: '/' + db.name + '/_design/' + id + '/_spatial/points'
    }, function(err, data) {
        if (err) {
            q.send_error('Unable to get spatial view data');
        }
        var row;
        for (var i=0, l = data.rows.length; i<l; i++) {
            row = data.rows[i];
            featureCollection.features.push({
                type: 'Feature',
                geometry: row.geometry,
                properties: {
                    id: row.id
                }
            });
        }
        q.send_json(featureCollection);
    });
}

// service description
if (q.method == 'OPTIONS') {
    var acceptedMethods = 'GET, POST';
    q.send_options({
        method: 'get_features',
        accepted: acceptedMethods,
        description: 'get a GeoJSON "FeatureCollection" document based on the "_spatial/points" view, for a given structure',
        params: {
            id: {
                type: 'string',
                description: 'structure id (without "_design/")',
                mandatory: true
            }
        }
    }, acceptedMethods);
} else {
    getFeatures(q.db, q.params.id);
}