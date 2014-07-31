/*
Web service : get a list of views and queries definitions docs, for a given structure
or for all the database (if no structure id is given)

URL :  server/_dm/db/get_views_queries
Params:
    - id: structure id (without '_design/')
*/

function getViewsAndQueries(db, id) {

    var viewsQueries = [],
        tasks = 2,
        vStartKey,
        vEndKey,
        qStartKey,
        qEndKey;

    if (id) {
        if (id.substr(0,8) != '_design/') {
            id = '_design/' + id;
        }
        vStartKey = ['v', id];
        vEndKey = ['v', id, {}];
        qStartKey = ['q', id];
        qEndKey = ['q', id, {}];
    } else {
        vStartKey = ['v'];
        vEndKey = ['v', {}];
        qStartKey = ['q'];
        qEndKey = ['q', {}];
    }

    // get views
    db.view('datamanager', 'views_queries', {
            startkey: vStartKey,
            endkey: vEndKey
        },
        function (err, vdata) {
            if(err) {
                q.send_error(err);
                return;
            }
            vdata.rows.forEach(function (e) {
                viewsQueries.push(e);
                //ids.push(e.id);
            });
            next();
        }
    );

    // get queries
    db.view('datamanager', 'views_queries', {
            startkey: qStartKey,
            endkey: qEndKey
        },
        function (err, qdata) {
            if(err) {
                q.send_error(err);
                return;
            }
            qdata.rows.forEach(function (e) {
                viewsQueries.push(e);
                //ids.push(e.id);
            });
            next();
        }
    );

    function next() {
        tasks--;
        if (tasks == 0) {
            q.send_json({
                rows: viewsQueries
            });
        }
    }
}

getViewsAndQueries(q.db, q.params.id);