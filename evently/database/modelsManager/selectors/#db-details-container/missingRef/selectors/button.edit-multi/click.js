function() {
    var app = $$(this).app,
        infos = app.infos,
        mm_id = infos.model.id,
        mm = null,
        utilsLib = app.getlib('utils'),
        cacheLib = app.getlib('cache'),
        fieldNames = [],
        ck = $('#missing-references table input.ck:checked');

    var decoded_id = utilsLib.decode_design_id(mm_id); // helps us guess if it is a mm
    mm = cacheLib.get_cached_mm(app, decoded_id);

    if (ck.length < 1) {
        utilsLib.showWarning('Please select at least one doc');
    } else {
        var ids = [];
        ck.each(function (i, e) {
            ids.push($(e).val());
            // propose only the ref fields containing missing values
            var modt = $(e).data('modt'),
                field = $(e).data('field'),
                label = field;
            if (mm) {
                if (modt && mm.modules[modt]) { // on sait jamais
                    for (var i=0; i < mm.modules[modt].fields.length; i++) {
                        if (field == mm.modules[modt].fields[i].name) {
                            label = mm.modules[modt].fields[i].label;
                        }
                    }
                }
            }
            if (field) {
                var found = false;
                for (var i=0; i < fieldNames.length && (! found); i++) {
                    found = (fieldNames[i].name == field);
                }
                if (! found) {
                    fieldNames.push({
                        name: field,
                        label: label
                    });
                }
            }
        });

        var trigger = new utilsLib.Trigger(null, null, null, true);
        $('#dialog-bloc').trigger('editMulti', [ids, trigger, fieldNames]);
    }

    return false;
}