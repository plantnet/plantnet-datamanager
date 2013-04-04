function (e) {

    var app = $$(this).app,
        utilsLib = app.getlib('utils');

    var f = $("form#edit-doc");

    var doc = e.data.args[0],
        mm = doc.$mm,
        modt = doc.$modt,
        id = '_local/' + mm.replace('_design/', '') + '##' + modt;

    var tplName = $('#preset-select-text').val();

    if (tplName == '') {
        utilsLib.showWarning('No preset selected');
        return false;
    }

    if (confirm('Save preset "' + tplName + '" ?')) {

        var preset = {};
        $(':input.editw', f).each(
            function () {
                var v = $(this).val(),
                    type = $(this).closest('div.edit').data('type');
                v = utilsLib.readWidget(v, type, '');
                //$.log("Saving " + this.id + " (type " + type + ") as ", v);
                preset[this.id] = v;
                if (type == 'ref') {
                    var refid = $(this).parent().find('input.ref-id').val();
                    preset[this.id] = {
                        value: v,
                        id: refid
                    };
                }
            });

        function saveTplDoc(tplDoc, tplName) {
            app.db.saveDoc(tplDoc, {
                success: function() {
                    utilsLib.showSuccess('Preset saved');
                    var availableTpls = {};
                    $('#available-presets-list .select-preset-cmd').each(function() {
                        availableTpls[$(this).attr('value')] = '';
                    });
                    if (! (tplName in availableTpls)) {
                        $('#available-presets-list').append('<li><a class="select-preset-cmd" value="' + tplName + '">' + tplName + '</a>');
                        $('#preset-select-combo').val(tplName);
                    }
                    app.data.lastUsedPreset = tplName;
                },
                error: function() {
                    utilsLib.showError('Error while saving preset');
                }
            });
        }

        app.db.openDoc(id, {
            success : function(doc) {
                if (! ('presets' in doc)) {
                    doc.presets = {};
                }
                doc.presets[tplName] = preset;
                saveTplDoc(doc, tplName);
            },
            error: function(msg) {
                // create new presets document for current modt
                var presets = {};
                presets[tplName] = preset;
                var tplDoc = {
                    _id: id,
                    presets: presets
                };
                saveTplDoc(tplDoc, tplName);
            }
        });
    }

    return false;
}