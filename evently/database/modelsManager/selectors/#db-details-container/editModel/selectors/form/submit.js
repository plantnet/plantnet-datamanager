function() {
    var app = $$(this).app,
        utilsLib = app.getlib('utils'),
        cacheLib = app.getlib('cache');

    utilsLib.showBusyMsg('Updating structure...', 'editMm');
    $('#dialog-bloc').trigger('busy', 'Updating structure...');
    $('#busy-modal').modal('show');
    // Trigger save is the first thing to do
    $('#mmmodules').trigger('save');

    var doc = app.data.mm,
        MM = app.getlib('mm'),
        msg = 'Structure updated';

    function onSuccess() {
        app.db.dm("up_changes", null, null, function (d) {
            //$.log("up changes from save mm complete", d);
            // put all mms in cache otherwise the modifications won't be taken in account until one refreshes the page
            cacheLib.init_all_mms(app, function() {
                $.pathbinder.begin();
                utilsLib.showSuccess(msg);
            });
        });
    }

    function onError(err_id, err_str, details) {
        $.log(err_id, err_str, details);
        var msg = err_id.responseText || err_str;
        utilsLib.showError('Error : ' + err_id + err_str + details);
    }

    // check doc
    try {
        var msg2 = [];
        MM.validate_mm(doc, app, msg2);
        for (var i=0; i < msg2.length; i++) {
            utilsLib.showSuccess('Using default label template "' + msg2[i].lt + '" for module "' + msg2[i].modt + '"');
        }
    } catch (x) {
        onError('', '', x.message);
        return false;
    }

    app.db.dm("update_mm", {mm : doc._id}, { mm: doc }, onSuccess, onError, 1000000, 
              function (res) {
                  app.data.structureEditorOpen = false;
                  // invalidate tree data (labels have a large probability to be regenerated)
                  if (app.data && app.data.tree) {
                      delete app.data.tree;
                  }
                  $('#busy-modal').modal('hide');
                  utilsLib.hideBusyMsg('editMm');

                  if (doc.isref) {
                      $.pathbinder.go('/tree/' + doc._id.slice(8) + '/0/1');
                  } else {
                      $.pathbinder.go('/viewtable/' + doc._id.slice(8) + '/0/_id/0/0/0/0/0/1');
                  }
              });

    return false;
};