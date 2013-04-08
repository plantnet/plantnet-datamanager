function(e, view, mm) {

    var app = $$(this).app,
        cache = app.getlib('cache'),
        cols = [];

    for (var i = 0; i < view.$cols.length; i++) {
        var modi = view.$cols[i].$modi,
            modt = mm.structure[modi][0],
            modtname = mm.modules[modt].name,
            field = view.$cols[i].field,
            label = view.$cols[i].label,
            mm_ref_id = view.$cols[i].mm_ref_id;

        if (typeof(label) === 'object') {
            var fname = field[1],
                fmodi = field[2],
                fieldLabel = field[3],
                refName = cache.get_name(app, mm_ref_id, fmodi);
            field = refName + ' (' + fname + ')';
            label = refName + ' (' + fieldLabel + ')';
        }

        cols.push({
            $modi: modi,
            index: i,
            modtname: modtname,
            field: field,
            label: (label ? label : field),
            fname: cache.get_name(app, mm._id, modi)
        });
    }
    //$.log(cols);
    return {
        cols: cols
    };
}