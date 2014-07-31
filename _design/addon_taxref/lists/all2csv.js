function (head, req) {

    // !code ../../views/lib/path.js

    var filename = req.query.fn,
        cols = JSON.parse(req.query.cols),
        ranks = JSON.parse(req.query.ranks);

    start({
	      "headers": {
		  "Content-Type": "application/force-download",
                  //"Content-Type": "application/csv",
		  "Content-disposition": "attachment; filename=" + filename,
		  "Pragma": "no-cache", 
                  "Cache-Control": "must-revalidate, post-check=0, pre-check=0, public",
                  "Expires": "0"
	      }
	  });
 
    var row, docs_by_id = {}, docs_by_num_nom = {}, errors = [];
    while ((row = getRow())) {
        if(!row.doc) { continue; }
        var id = row.id, num_nom = row.doc.num_nom;
        docs_by_id[id] = row.doc;
        
        if(!num_nom || docs_by_num_nom[num_nom]) {
            errors.push(row.doc);
        }
        docs_by_num_nom[num_nom] = true;
    }

    if(errors.length) {
        send("Bad 'num nom' with the following docs\n\n");
        for (var e = 0; e < errors.length; e++){
            send(JSON.stringify(errors[e]) + "\n\n");
        }
        return;
    }

       
    var headers = ["num_nom_retenu", "num_tax_sup", "rang"];
    headers = headers.concat(cols);
    var header_str = headers.join(","), out_str ="", error = false;


    send( header_str  + '\n');
 
    for (var id in docs_by_id) {
        var doc = docs_by_id[id], out;

        try {

            var parent = exports.get_parent(doc);

            doc.num_tax_sup = parent ? docs_by_id[parent].num_nom : 0;
            doc.rang = ranks[doc.$modi];
            
            if(doc.$synonym) {
                doc.num_nom_retenu = docs_by_id[doc.$synonym].num_nom;
                doc.num_tax_sup = "";
            } else {
                doc.num_nom_retenu = doc.num_nom;
            }
            
            for (var c = 0; c < headers.length; c++) {
                var v = doc[headers[c]];
                v = (v != null) ? v : "";
                out_str += '\"' + v + '\",';
            }
            out_str += "\n";

        } catch (x) {
            send("Exception " + x + JSON.stringify(doc) + "\n");
            error = true;
        }
    }
    if(!error) {
        send(out_str);
    }
}