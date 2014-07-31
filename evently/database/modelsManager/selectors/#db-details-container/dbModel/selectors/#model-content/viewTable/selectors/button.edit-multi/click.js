function() {
    var app = $$(this).app,
        infos = app.infos,
        mm_id = infos.model.id,
        utilsLib = app.getlib('utils'),
        cacheLib = app.getlib('cache'),
        fieldNames = [],
        ck = $('table.data input.ck:checked');

    // try to get the structure and modt to obtain fields list
    var decoded_id = utilsLib.decode_design_id(mm_id); // helps us guess if it is a mm
    if (decoded_id.substr(0,8) == '_design/') {
        var mm = cacheLib.get_cached_mm(app, decoded_id);
        if (mm) {
            var modt = infos.module.id;
            //$.log('mm_id', mm_id, 'modt', modt);
            if (modt == undefined) {
                var modi = infos.module.instance.id;
                if (modi) {
                    modt = modi.substr(modi.lastIndexOf('.') + 1);
                    //$.log('modi', modi, 'modt after', modt);
                } // else it's a view
            } else {
                if (modt[0] == '*') {
                    modt = modt.slice(1);
                }
            }
            if (modt && mm.modules[modt]) { // on sait jamais
                var field;
                for (var i=0; i < mm.modules[modt].fields.length; i++) {
                    field = mm.modules[modt].fields[i];
                    fieldNames.push({
                        name: field.name,
                        label: field.label || field.name
                    });
                }
            }
            //$.log('fieldnames', fieldNames);
        }
    }

    if (ck.length < 1) {
        utilsLib.showWarning('Please select at least one doc');
    } else {
        var ids = [];
        ck.each(function (i, e) {
            ids.push($(e).val());
        });

        var trigger = new utilsLib.Trigger(null, null, null, true);
        $('#dialog-bloc').trigger('editMulti', [ids, trigger, fieldNames]);
    }
    return false;
}