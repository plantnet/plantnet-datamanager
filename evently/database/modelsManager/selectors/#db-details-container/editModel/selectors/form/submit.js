function() {
    var utilsLib = $$(this).app.getlib('utils');
    
    utilsLib.showBusyMsg('Updating structure...', 'editMm');
    $('#dialog-bloc').trigger('busy', 'Updating structure...');
    $('#busy-modal').modal('show');
    // Trigger save is the first thing to do
    $('#mmmodules').trigger('save');
    
    
    var app = $$(this).app,
        doc = app.data.mm,
        original_json = app.data.orig_mm_json,
        MM = app.getlib('mm'),
        msg = 'Structure updated';

    function onSuccess() {
        utilsLib.hideBusyMsg('editMm');
        app.db.dm("up_changes", null, null, function (d) {
            //$.log("up changes from save mm complete", d);
            $('#busy-modal').modal('hide');
            $('#model-bloc').trigger('_init');
            $.pathbinder.begin();
            app.libs.utils.show_msg(msg);
        });
    }

    function onError(err_id, err_str, details) {
        $.log(err_id, err_str, details);
        $('#busy-modal').modal('hide');
        utilsLib.hideBusyMsg('editMm');
        var msg = err_id.responseText || err_str;
        utilsLib.showError('Error : ' + err_id + err_str + details);
    }

    // check doc
    try {
        var msg2 = [];
        MM.validate_mm(doc, app, msg2);
        for (var i=0; i < msg2.length; i++) {
            app.libs.utils.show_msg('Using default label template "' + msg2[i].lt + '" for module "' + msg2[i].modt + '"');
        }
    } catch (x) {
        onError('', '', x.message);
        return false;
    }

    if (original_json == JSON.stringify(doc)) {
        msg = 'Nothing to save';
        onSuccess();
        return false;
    }

    app.db.dm("update_mm", {mm : doc._id}, doc, onSuccess, onError, 1000000, 
              function (res) {
                  $.log('COMPLETE', res);
              });

    return false;
};