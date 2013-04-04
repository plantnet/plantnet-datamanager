function (head, req) {

    var param = req.query.param;
    if (param) {
        param = JSON.parse(param);
    }

    start({
        "headers": {
            "Content-Type": "application/json"
        }
    });

    var lib = require('vendor/datamanager/lib/commonddoc');

    // list all field by type
    var fields = lib.parse_param(param),
        id,
        prev_id,
        row,
        data = {};

    send('[');

    // return map of doc grouped by type
    function format(data) {
        return JSON.stringify(data);
    }

    // for each input row
    while ((row = getRow())) {

        id = row.key;
        prev_id = prev_id || id;

        if (id !== prev_id) {
            send(format(data) + ',\n'); 
            // reinit
            data = {};
            prev_id = id;
        }
        if(row.doc) {
            row.doc._attchs = row.value._attchs;
            lib.group_objects(id, row.doc, fields, data);
        }
    }

    // send last line
    var out = format(data);
    if(out != "{}") {
        send(out + '\n'); 
    }
    send(']');
}