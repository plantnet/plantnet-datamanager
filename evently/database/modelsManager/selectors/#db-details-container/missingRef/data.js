function (mm, mmRef, rows) {
    rows = rows.map(function(e) {
        e.value.field = e.key[2];
        e.value.module = mm.modules[e.key[1]].name;
        e.value._id = e.id;
        return e.value;
    });
    return {
        mm_name: mm.name,
        mm_ref_name: mmRef.name,
        rows: rows
    };
}