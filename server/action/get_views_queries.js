/*
Web service : get a list of ids of views and queries definitions docs, for a given structure

URL :  server/_dm/db/get_views_queries
Params:
    - id: structure id (without '_design/')
*/

function getViewsAndQueries(db, id) {

    id = '_design/' + id;

    var ids = [],
        tasks = 2;

    // get views
    db.view('datamanager', 'views_queries', {
            startkey: ['v', id],
            endkey: ['v', id, {}]
        },
        function (err, vdata) {
            if(err) {
                q.send_error(err);
                return;
            }
            vdata.rows.forEach(function (e) {
                ids.push(e.id);
            });
            next();
        }
    );

    // get queries
    db.view('datamanager', 'views_queries', {
            startkey: ['q', id],
            endkey: ['q', id, {}]
        },
        function (err, qdata) {
            if(err) {
                q.send_error(err);
                return;
            }
            qdata.rows.forEach(function (e) {
                ids.push(e.id);
            });
            next();
        }
    );

    function next() {
        tasks--;
        if (tasks == 0) {
            q.send_json(ids);
        }
    }
}

getViewsAndQueries(q.db, q.params.id);