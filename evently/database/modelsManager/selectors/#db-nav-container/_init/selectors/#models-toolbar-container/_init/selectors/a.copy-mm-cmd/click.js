function(e) {

    var app = $$(this).app,
        utilsLib = app.getlib('utils'),
        mmLib = app.getlib('mm'),
        mmId = $('.nav-tabs li.active ul li.active a').data('mm-id'),
        that = this;

    mmId = app.libs.utils.decode_design_id(mmId);

    function onError(e) {
        utilsLib.hideBusyMsg('copyMm');
        if (!e) {
            e = 'Cannot copy structure';
        }
        utilsLib.showError(e);
    }

    function onSuccess() {
        utilsLib.hideBusyMsg('copyMm')
        utilsLib.showSuccess('Structure layout copied');
        $(that).trigger('_init');
        $.pathbinder.begin();
    }

    var newMmName = prompt('Choose a name for the new structure');
    if (newMmName) {
        utilsLib.showBusyMsg('Copying structure layout...', 'copyMm')
        mmLib.copy_mm(app.db, mmId, newMmName, onSuccess, onError);
    }

    return false;
}