function(query, views) {
    var utilsLib = $$(this).app.getlib('utils'),
        viewsProcessed = views.rows.map(function(e) {
            return {
                name: e.value.name,
                _id: e.id
            };
        });

    return {
        query_id: query._id,
        mm_id: utilsLib.encode_design_id(query.$mm),
        select_modt: '*' + query.$select, // wtf? why a '*' ?
        views: viewsProcessed
    };
}