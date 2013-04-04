function (head, req) {

    var param = req.query.param;
    if (param) {
        param = JSON.parse(param);
    }
    var selection_id = req.query.sid,
        filename = req.query.fn,
        separator = req.query.separator,
        modname = req.query.modname,
        lib = require('vendor/datamanager/lib/commonddoc');

    var row;

    // return csv data
    function format(doc) {
        var ret = "";
        for (var m = 0; m < param.length; m++) {
            var field = param[m].field,
            data = doc && (doc[field] !== undefined) ? doc[field] : "";
            ret += lib.csv_encode(data, separator);
        }
        return ret.slice(0, -1); //remove last ","
    }

    start({
      "headers": {
	  "Content-Type": "application/force-download",
	  //"Content-Transfer-Encoding": "application/octet-stream\n",
	  "Content-disposition": "attachment; filename=" + filename,
	  "Pragma": "no-cache", 
              "Cache-Control": "must-revalidate, post-check=0, pre-check=0, public",
              "Expires": "0"
      }
    });

    send(lib.get_header(param, separator, modname) + "\n");

    var ids, index = {}, prev_id, doc;

    while ((row = getRow())) {
        var key = row.key;
        var id = row.id;
        
        if(!key) { // parse selection
            if(row.id === selection_id) {
                ids = row.doc.ids;    
                for(var i = 0, l = ids.length; i < l; i++) {
                    index[ids[i]] = 1;
                }
            }
            continue;
        }

        // filter selection
        if(ids && !index[id]) {
            continue;
        }

        prev_id = prev_id || id;
        if (id !== prev_id) {
            send(format(doc) + '\n');
            // reinit
            doc = undefined;
            prev_id = id;
        }
        if(row.doc) {
            row.doc._attchs = row.value._attchs;
            doc = row.doc;
        }
    }
    // send last line
    var out = format(doc);
    send(out + '\n');
}