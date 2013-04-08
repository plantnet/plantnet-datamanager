function (head, req) {

    var filename = req.query.fn || "datamanager_dump.json";

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
    
    var row, line;
    send('[');

    while ((row = getRow())) {
        if(line) send(',');
        send(JSON.stringify(row.doc));
        line = true;
    }
    send(']');
}