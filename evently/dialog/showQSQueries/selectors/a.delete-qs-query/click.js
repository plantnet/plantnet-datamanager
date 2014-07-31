function () {
	var app = $$(this).app,
		utilsLib = app.getlib('utils'),
		elem = $(this),
		identifier = JSON.stringify(elem.data('identifier'));

	var answer = confirm('Delete this query ?');

	if (answer) {
		var qs_doc_id = '_local/quick_search';
		app.db.openDoc(qs_doc_id, {
	        success: function(doc) {
	            remove_query(doc);
	        },
	        error: function(err) {
	            utilsLib.showError('Error while loading queries.');
	        }
	    });

	    function remove_query(doc) {
	    	for (var i = 0; i < doc.queries.length; i++) {
	    		if (doc.queries[i].tostring == identifier) {
	    			doc.queries.splice(i, 1);
	    		}
	    	}
	    	app.db.saveDoc(doc, {
	            success: function(newDoc) {
	            	elem.parent('td').parent('tr').first().remove();
	                utilsLib.showSuccess('Query deleted.');
	            },
	            error: function() {
	                utilsLib.showError('Error while deleting query.');
	            }
	        });
	    }
	}

	return false;
}