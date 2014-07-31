function (active_id, doc, syndata) {

    var app = $$(this).app,
        active_label,
        doc_label,
        commonStructure;

    // set multiple synonyms at once: assume that all selected docs are from the
    // same structure (can it even be false?)
    if (! doc) { 
        commonStructure = syndata[0].doc.$mm;
    }

    var rows = syndata.map(
        function (e) {
            e.label = e.doc.$label;
            if(e.id === active_id) {
                active_label = e.label;
                e.selected = true;
            }
            if(doc && (e.id == doc._id)) {
                doc_label = e.label;
            }
            if(!app.libs.utils.get_parent(e.doc)) { // if no parent // wtf?
                e.disabled = true;
            }
            return e;
        }
    );

    rows.sortBy("label");
    var has_syn = rows.length > 1;

    return {
        active_id : active_id,
        doc_id : (doc ? doc._id : null),
        mm : (doc ? doc.$mm : commonStructure),
        label : doc_label,
        active_label : active_label,
        rows : rows,
        has_syn : has_syn
    };
}