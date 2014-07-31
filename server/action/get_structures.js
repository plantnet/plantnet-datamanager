/*
Web service : get all structures names and ids

URL :  server/_dm/db/get_structures
*/

var structures;

function getStructures(db) {

    structures = [];

    db.allDocs({
            startkey: '_design/mm_',
            endkey: '_design/mm_\ufff0',
            include_docs: true,
        },
        function (err, data) {
            if(err) {
                q.send_error(err);
                return;
            }
            data.rows.forEach(function (e) {
                structures.push({
                    _id: e.id,
                    name: e.doc.name,
                    isref: e.doc.isref
                });
            });
            getNbDocs(db, next);
        }
    );
}

getStructures(q.db);

function getNbDocs (db, callback) {
    var nbTasks = structures.length;
    if (nbTasks == 0) {
        callback();
        return;
    }
    for (var i = 0; i < structures.length; i++) {
        (function(j) {
            db.view('datamanager', 'by_mm', {
                key : structures[j]._id
            }, function (err, data) {
                structures[j].nbDocs = '-';
                if (err) {
                    structures[j].nbDocs = '-';
                }
                if (data.rows.length) {
                    structures[j].nbDocs = data.rows[0].value;
                }
                nbTasks--;
                if (nbTasks == 0) {
                    callback();
                }
            });
        }(i));
    }
}

function next () {
    q.send_json(structures);
}