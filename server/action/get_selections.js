/*
Web service : get all selections names and ids

URL :  server/_dm/db/get_selections
*/

function getSelections(db, callback) {

    var selections;

    db.view('datamanager', 'selections', {},
        function (err, data) {
            if(err) {
                q.send_error(err);
                return;
            }
            selections = data.rows;
            selections.sort(function(a, b) {
                return (a.key.toLowerCase() > b.key.toLowerCase()) ? 1 : -1;
            });
            //q.send_json(callback + '(' + JSON.stringify(selections) + ');'); // JSONP attempt :-/
            q.send_json(selections);
        }
    );
}

getSelections(q.db, q.params.callback);