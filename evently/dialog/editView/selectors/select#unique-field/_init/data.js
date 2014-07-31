function(e) {

    var app = $$(this).app,
        cacheLib = app.getlib('cache'),
        view = e.data.args[0],
        mm = e.data.args[1],
        fields = [],
        col,
        modiLabel;

    for (var i=0; i < view.$cols.length; i++) {
        col = view.$cols[i];
        if (col) {
            modiLabel = cacheLib.get_name(app, mm._id, col.$modi);
            fields.push({
                name: col.field,
                label:  modiLabel + '.' + (col.label || col.field),
                active: col.field == view.$unique
            });
        }
    }

    return {
        fields: fields
    };
}