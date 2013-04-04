function (e, query) {

    // for each row save op and value(s)
    $('#criteria tbody tr').each(function(i, row) {
        var c = query.$criteria[i],
            scrollCheckboxes = $(this).find('div.scroll-checkboxes'),
            multiopts = $('.dropdown-menu').find('input.ck'),
            cvalue = null;

        c.op = $('select.op', row).val();

        if (c.op.indexOf('range') > -1) {
            c.min = $('input.min', row).val();
            c.max = $('input.max', row).val();
            delete c.value;
        } else {
            if (multiopts.length) {
                cvalue = [];
                multiopts.each(function() {
                    var checked = ($(this).attr("checked") == "checked"),
                        val = $(this).val();
                    if (checked) {
                        cvalue.push(val);
                    }
                });
            } else {
                cvalue = $('select.value', row).val() || $('input.value', row).val();
            }
            c.value = cvalue;
            // $.log('c.value', c.value);
            delete c.min;
            delete c.max;
        }
    });
}