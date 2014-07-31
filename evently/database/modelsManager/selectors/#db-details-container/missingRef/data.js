function (mm, mmRef, rows) {

    rows = rows.map(function(e) {
        e.value.field = e.key[2];
        e.value.module = mm.modules[e.key[1]].name;
        e.value.modt = e.key[1];
        e.value._id = e.id;
        return e.value;
    });

    rows.sort(function(a,b) {
        var aval = '' + a.val, // undefined is not ordered the same way by different browsers
            bval = '' + b.val;
        aval = aval.toLowerCase().trim();
        bval = bval.toLowerCase().trim();
        if (aval < bval) {
            return -1;
        } else if(aval > bval) {
            return 1;
        } else {
            return 0;
        }
    });

    return {
        mm_name: mm.name,
        mm_ref_name: mmRef.name,
        rows: rows,
        hasRows: rows.length
    };
}