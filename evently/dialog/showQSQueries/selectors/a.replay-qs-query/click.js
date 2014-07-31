function () {
	var app = $$(this).app,
		utilsLib = app.getlib('utils'),
		elem = $(this),
		identifier = JSON.stringify(elem.data('identifier'));

	var qs_doc_id = '_local/quick_search';
	app.db.openDoc(qs_doc_id, {
        success: function(doc) {
            replay_query(doc);
        },
        error: function(err) {
            utilsLib.showError('Error while loading queries.');
        }
    });

    function replay_query(doc) {
    	var i = 0,
    		find = false;
    	while (i < doc.queries.length && !find) {
    		if (doc.queries[i].tostring == identifier) {
    			find = true;
    			var query = doc.queries[i];
    			//
    			$('#quicksearch-input-field').val(query.req);
    			$('#quicksearch-structure-selector').val(query.structure).change();
    			$('#quicksearch-module-selector').val(query.module).change();
    			$('#quicksearch-field-selector').val(query.field).change();
				setTimeout(function() {
					$('#quicksearch-view-selector').val(query.view);
                    $('#quick-search').submit();
				}, 500);
    			//
    			$('#quicksearch-queries-modal').modal('hide');
    		}
    		i++;
    	}
    }

	return false;
}