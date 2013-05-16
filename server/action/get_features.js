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

getFeatures(q.db, q.params.id);