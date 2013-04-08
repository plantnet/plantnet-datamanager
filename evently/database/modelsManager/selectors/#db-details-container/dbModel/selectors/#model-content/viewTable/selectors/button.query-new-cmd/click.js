function(e) {
    var app = $$(this).app,
        utilsLib = app.getlib('utils'),
        name = e.data.args[1],
        mm_id = e.data.args[2],
        cols = e.data.args[3],
        modi = e.data.args[4];
    
    var modt = modi.split('.').last();
    if (modi === modt) {
        modt = modt.slice(1); // remove first *
        modi = null;
    }
    
    var query = {
        $criteria: [],
        $select: modt,
        name: name
    };
    
    if (modi) { // query do not support query on modt;
        for (var i = 0; i < cols.length; i++) {
            query.$criteria.push({
                field: cols[i].field,
                label: cols[i].label,
                $modi: cols[i].$modi || modi
            });
        }
    }
    
    $('#dialog-bloc').trigger('editQuery', [mm_id, null, query]);
    
    return false;
}