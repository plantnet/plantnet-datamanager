function (head, req) {

    // var param =  [ { "$modi" : ".individu",
    //                  "field" : "_id"
    //                },  
    //                { "$modi" : ".individu.determination",
    //                  "field" : "_id"
    //                }
    //              ];
    // var selection_id = "4002e987396195b0ab151842ec9c7ffd";

    var param = req.query.param;
    if (param) { param = JSON.parse(param); }

    var selection_id = req.query.sid,
        filename = req.query.fn,
        //expand_geoloc = JSON.parse(req.query.expand_geoloc),
        separator = req.query.separator;

    var row,
        lib = require('vendor/datamanager/lib/commonddoc'),
        fields = lib.parse_param(param);

    // return csv data
    function format(data) {
        var ret = "";
        for (var m = 0; m < param.length; m++) {
            var modi = param[m].$modi;
           
            var tmp = "";
            if(data[modi]) {
                for (var i = 0; i < data[modi].length; i++) {                
                    var val = data[modi][i][m]; // indexed with a number
                    if(val) {
                        tmp += val + ' ';
                    }
                }
                tmp = tmp.slice(0, - 1); // remove last space
            }
            ret += lib.encode_csv(tmp, separator);
            
        }
        return ret.slice(0, -1); // remove last ","
        //return ret;
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
    send(lib.get_header(param, separator) + "\n");
    
    var ids, index = {}, prev_id, data = {};

    while ((row = getRow())) {
        var id = row.key;
        
        if(!id) { // parse selection
            if(row.id === selection_id) {
                ids = row.doc.ids;    
                for(var i = 0, l = ids.length; i < l; i++) {
                    index[ids[i]] = 1;
                }
            }
            continue;
        }

        // filter selection
        if(ids && !index[id]) { continue; }
        
        prev_id = prev_id || id;
        if (id !== prev_id) {
            send(format(data) + '\n'); 
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
    send(out + '\n'); 
}