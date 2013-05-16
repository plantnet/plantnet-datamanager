/*
Web service : get contents of a selection (list of ids)

URL :  server/_dm/db/get_selection_contents
Params:
    - id: the selection id
*/

function getSelectionContents(db, id) {

    log('GSC CALLED WITH id: ' + id);
    db.getDoc(id, function (err, data) {
        if(err) {
            q.send_error(err);
            return;
        }
        q.send_json(data.ids);
    });
}

getSelectionContents(q.db, q.params.id);