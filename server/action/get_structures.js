/*
Web service : get all structures names and ids

URL :  server/_dm/db/get_structures
*/

function getStructures(db) {

    var structures = [];

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
                    id: e.id,
                    name: e.doc.name
                });
            });
            q.send_json(structures);
        }
    );
}

getStructures(q.db);