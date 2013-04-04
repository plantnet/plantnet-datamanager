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

    // get available presets - should read them from the real doc?
    var availableTpls = {};
    $('#available-presets-list .select-preset-cmd').each(function() {
        availableTpls[$(this).attr('value')] = '';
    });
    if (! (tplName in availableTpls)) {
        utilsLib.showError('Preset has not been saved yet');
        return false;
    }

    if (confirm('Delete preset "' + tplName + '" ?')) {
        app.db.openDoc(id, {
            success : function(doc) {
                delete doc.presets[tplName];
                app.db.saveDoc(doc, {
                    success: function() {
                        utilsLib.showSuccess('Preset deleted');
                        $('#available-presets-list a[value="' + tplName + '"]').parent().remove();
                        $('#preset-select-text').val('');
                    },
                    error: function() {
                        utilsLib.showError('Error while saving preset');
                    }
                });
            },
            error: function(msg) {
                utilsLib.showError('Error while deleting preset');
            }
        });
    }

    return false;
} 