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
        var ret = '',
            data,
            field;
        for (var m = 0; m < param.length; m++) {
            field = param[m].field;
            if (doc[field] !== undefined) {
                data = doc[field];
                if ((field == '_attchs_urls') || (field == '_attchs_files')) { // attachments are arrays but must be separated by "\n" and not ","
                    data = '';
                    if (doc[field] && (Object.prototype.toString.call(doc[field]) === '[object Array]')) {
                        for (var i=0; i < doc[field].length; i++) {
                            data += doc[field][i];
                            if (i < doc[field].length - 1) {
                                data += "\n";
                            }
                        }
                    }
                }
            } else {
                data = '';
            }
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

    log(param);
    send(lib.get_header(param, separator, modname, true) + "\n");

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
            // attachments
            row.doc._attchs_files = [];
            row.doc._attchs_urls = [];
            for (a in row.doc._attachments) {
                row.doc._attchs_files.push(a);
            }
            for (a in row.doc.$attachments) {
                row.doc._attchs_urls.push(a);
            }
            //row.doc._attchs = row.value._attchs;
            doc = row.doc;
        }
    }
    // send last line
    var out = '';
    if (doc) {
        out = format(doc);
    }
    send(out + '\n');
}