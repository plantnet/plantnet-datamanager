function (active_id, doc, syndata) {
    var app = $$(this).app;
    var MM = app.getlib("mm");

    var active_label, doc_label, label_tpl, rows = syndata.map(
        function (e) {

            e.label = e.doc.$label;

            if(e.id === active_id) {
                active_label = e.label;
                e.selected = true;
            }
            if(e.id == doc._id) {
                doc_label = e.label;
            }
            if(!app.libs.utils.get_parent(e.doc)) { // if not parent
                e.disabled = true;
            }
            return e;
        });


    rows.sortBy("label");
    var has_syn = rows.length > 1;

    return {
        active_id : active_id,
        doc_id : doc._id,
        mm : doc.$mm,
        label : doc_label,
        active_label : active_label,
        rows : rows,
        has_syn : has_syn
    };

}	
