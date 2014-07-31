function (e, query) {

    // gets rid of double quotes that make everything go wrong
    // and fixes partial dates to comply to the format YYYY-MM-DD
    function normalize(v, type) {
        if (!v) return v;
        if (type == 'multi-enum') {
            for (var i = 0; i < v.length; i++) {
                cv = v[i];
                // left trim of "
                while(cv[0] == '"') {
                    cv = cv.slice(1);
                }
                // right trim of "
                while (cv[cv.length-1] == '"') {
                    cv = cv.substr(0,cv.length-1);
                }
                //v = v.replace(/"/g, '\\"'); // needs to unescape before displaying in editor
                cv = cv.replace(/"/g, ' '); // much simpler
                v[i] = cv;
            }
            return v;
        }
        // left trim of "
        while(v[0] == '"') {
            v = v.slice(1);
        }
        // right trim of "
        while (v[v.length-1] == '"') {
            v = v.substr(0,v.length-1);
        }
        //v = v.replace(/"/g, '\\"'); // needs to unescape before displaying in editor
        v = v.replace(/"/g, ' '); // much simpler
        // partial date format
        if (type == 'date') {
            if (typeof v == 'string') {
                if (v.length == 4) { // let's say it's YYYY
                    v = v + '-01-01';
                } else if (v.length == 7) { // let's say it's YYYY-MM
                    v = v + '-01';
                }
            } else {
                return '0000-01-01';
            }
        }
        return v;
    }

    // for each row save op and value(s)
    $('#criteria tbody tr').each(function(i, row) {
        var c = query.$criteria[i],
            multiopts = $('.dropdown-menu', this).find('input.ck'),
            cvalue = null;

        c.op = $('select.op', row).val();

        if (c.op.indexOf('range') > -1) {
            c.min = normalize($('input.min', row).val(), c.type);
            c.max = normalize($('input.max', row).val(), c.type);
            delete c.value;
        } else {
            if (multiopts.length) {
                cvalue = [];
                multiopts.each(function() {
                    var checked = ($(this).attr("checked") == "checked"),
                        val = $(this).val();
                    if (checked) {
                        cvalue.push(val); // normalize?
                    }
                });
            } else {
                cvalue = $('select.value', row).val() || $('input.value', row).val();
            }
            c.value = normalize(cvalue, c.type);
            // $.log('c.value', c.value);
            delete c.min;
            delete c.max;
        }
    });
}