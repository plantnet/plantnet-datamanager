function(head, req) {
    var row;

    var param = req.query.param;
    if(param) { param = JSON.parse(param); }
    param = [ { "module" : "individu",
                "fields" : [{"name" : "_id"}] },  
              { "module" : "herbier",
                "fields" : [{"name" : "_count"}] },  
              { "module" : "determination",
                "fields" : [{"name" : "_count"}] },
              { "module" : "observation",
                "fields" : [{"name": "_count" }] }
            ];
  
    function format(id, data) {
	var res = {};

	// for each module in query
	for(var i=0; i<param.length; i++) {
	    var p = param[i];
	    var output_key = p.module;
	    if(p.parent) { output_key += p.parent; }

	    res[output_key] = []; // output

	    var doc = data[p.module];
	    if(!doc) {
		doc = {_id : id};
	    }
	    var doc_data = [];
	    // for each field in query
	    for(var f=0; f < p.fields.length; f++) {
		var field = p.fields[f];
		var val = doc[field.name];
		doc_data.push(val);
	    }

	    res[output_key].push(doc_data);
	    
	}


	return JSON.stringify(res);
    }

    start({
	      "headers": {
		  "Content-Type": "application/json"
	      }
	  });
    
    send('[');
 
    var cpt = 0;
    // for each input row
    while( (row = getRow()) ) {
	send( (cpt++)?",\n":"" );
	var out = format(row.key, row.value);
	send( out );
    }

    send(']');
}