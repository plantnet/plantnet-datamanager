function(e) {
    var params = e.data.args[1],
        mmName = params.mmName,
        mmId = params.mmId;

    var chk_purge = ($('#delete-purge').attr('checked') == 'checked'),
        chk_layout = ($('#delete-layout').attr('checked') == 'checked'),
        chk_views_qeries = ($('#delete-views-qeries').attr('checked') == 'checked');

    var answer = confirm('Delete data' + ((chk_purge)?' and purge':'') + ((chk_layout)?' and layout':'') + ((chk_views_qeries)?' and views and queries':'') + ' for the structure "'+mmName+'" ?');

    if (answer) {
        var app = $$(this).app,
            utilsLib = app.getlib('utils'),
            mmLib = app.getlib('mm'),
            dbLib = app.getlib('db');

            function onError(errorMsg) {
                errorMsg = (errorMsg) ? errorMsg : 'Cannot remove data and layout for this structure';
                utilsLib.showError(errorMsg);
                utilsLib.hideBusyMsg('deleteMmData');
            }

            function onSuccess() {
                // invalidate tree data
                if (app.data && app.data.tree) {
                    delete app.data.tree;
                }
                $.pathbinder.go('/db-manager');
                utilsLib.showSuccess('Data' + ((chk_purge)?' and purge':'') + ((chk_layout)?' and layout':'') + ((chk_views_qeries)?' and views and queries':'') + ' for this structure have been removed.');
                utilsLib.hideBusyMsg('deleteMmData');
            }

            mmId = utilsLib.decode_design_id(mmId);

            utilsLib.showBusyMsg('Deleting data' + ((chk_purge)?' and purge':'') + ((chk_layout)?' and layout':'') + ((chk_views_qeries)?' and views and queries':'') + ' for structure "'+mmName+'"...', 'deleteMmData');

            if (chk_purge) {
                mmLib.purge_mm_docs(app.db, mmId, next, onError, chk_views_qeries);
            } else {
                mmLib.delete_mm_docs(app.db, mmId, next, onError, chk_views_qeries);
            }
    }

    function next() {
         if (chk_layout) {
            dbLib.bruteForceDelete(app.db, mmId,
            function(data) {
                onSuccess();
            },
            function(e) {
                onError(e);
            });
        } else {
            onSuccess();
        }
    }

    $('#delete-mm-data-modal').modal('hide');
    return false;
}