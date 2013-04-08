function (head, req) {

    // var cols =  [ { "$modi" : "id1",
    //                  "field" : "_id"
    //                },  
    //                { "$modi" : "herb1",
    //                  "field" : "_id"
    //                }
    //              ];
                
                       
    var cols = req.query.cols,
    lucene_skip = req.query.lucene_skip;

    if (cols) { cols = JSON.parse(cols); }
    lucene_skip = parseInt(lucene_skip);

    start({ "headers": {
         	"Content-Type": "application/json"
            }
          });
    
    var lib = require('vendor/datamanager/lib/commonddoc');
    

    function format(docs_by_modi, cols, current_modi) {
        var ret = [], field, modi, d, data;
        for (var m = 0; m < cols.length; m++) {
            field = cols[m].f;
            modi = cols[m].m;

            // output data from the same modi branch
            if (current_modi.slice(0, modi.length)
               === modi) {
                d = docs_by_modi[modi];
                data = d && d[field] ? d[field] : "";
            } else {
                data = "";
            }

            ret.push(data);
        }
        return JSON.stringify(ret);
    }

 
    var prev_key, key, row,
    nb_fully_processed = 0,
    nb_line_processed = 0,
    cpt = 0,
    data = {};
    
    send('{"head":' + JSON.stringify(head) + ',"rows":[');

    // for each input row
    while ((row = getRow())) {
        key = row.key;
        cpt ++;

        prev_key = prev_key || key;
        if (key !== prev_key) {
            // reinit
            data = {};
            prev_key = key;
            nb_fully_processed ++; // nb key fully processed
            nb_line_processed = 0; // nb line of the last key
        }
        if(row.doc) {
            var doc = row.doc;
            nb_line_processed ++;
            doc._attchs = row.value._attchs;
            data[doc.$modi] = doc;

            send(format(data, cols, doc.$modi) + ',\n'); 
        }
    }

    nb_fully_processed += lucene_skip;

    send('0],' + 
         '"lucene_skip":'+ nb_fully_processed +',' +
         '"related_skip":'+ nb_line_processed +'}\n'
        );
}