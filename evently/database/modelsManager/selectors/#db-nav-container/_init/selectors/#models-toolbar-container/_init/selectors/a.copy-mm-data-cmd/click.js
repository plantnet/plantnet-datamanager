function(e) {
    var app = $$(this).app,
        utilsLib = app.getlib('utils'),
        mmLib = app.getlib('mm'),
        mmId = $('.nav-tabs li.active ul li.active a').data('mm-id'),
        that = this;

    mmId = app.libs.utils.decode_design_id(mmId);

    function onError(e) {
        utilsLib.hideBusyMsg('copyMmAndData');
        if (!e) {
            e = 'Cannot copy structure and data';
        }
        utilsLib.showError(e);
        $('#busy-modal').modal('hide');

    }

    function onSuccess() {
        utilsLib.hideBusyMsg('copyMmAndData')
        utilsLib.showSuccess('Model structure and data copied');
        $('#busy-modal').modal('hide');

        $(that).trigger('_init'); 
        $.pathbinder.begin();
    }

    var newMmName = prompt('Choose a name for the new model');
    if (newMmName) {
        utilsLib.showBusyMsg('Copying data and structure.', 'copyMmAndData')
        $('#dialog-bloc').trigger('busy', 'Copying data...');
        $('#busy-modal').modal('show');

        mmLib.copy_mm(app.db, mmId, newMmName, function (data) {
            app.db.dm('datamanager/copy_mm_data', {old_mm:mmId, new_mm:data.id}, null, 
                      onSuccess, onError);
        }, onError);

    }

    return false;
}