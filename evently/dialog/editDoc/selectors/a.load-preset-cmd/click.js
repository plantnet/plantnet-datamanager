function (e) {

    var app = $$(this).app,
        utilsLib = app.getlib('utils');

    var f = $("form#edit-doc");

    var doc = e.data.args[0],
        mm = doc.$mm,
        modt = doc.$modt,
        id = "_local/" + mm.replace('_design/', '') + '##' + modt;

    var tplName = $('#preset-select-text').val();
    if (tplName == '') {
        utilsLib.showWarning('No preset selected');
        return false;
    }

    app.db.openDoc(id, {
        success : function (presetDoc) {
            if (('presets' in presetDoc) && (tplName in presetDoc.presets)) {
                var preset = presetDoc.presets[tplName];
                $('.editw', f).each(
                    function () {
                        var type = $(this).closest('div.edit').data('type');
                            value = preset[this.id];
                        //$.log('loading ', value, ' in ' + this.id, 'type', type);
                        if (type == 'ref') {
                            value = preset[this.id].value;
                            $(this).parent().find('input.ref-id').val(preset[this.id].id);
                        }
                        utilsLib.writeWidget($(this), value, type);
                    }
                );
                utilsLib.showSuccess('Preset loaded');
                app.data.lastUsedPreset = tplName;
            } else {
                utilsLib.showError('Error while loading preset');
            }
        }, error: function () {}
    });

    return false;
}