function() {
    var app = $$(this).app,
        ids = [],
        utilsLib = app.getlib('utils'),
        cacheLib = app.getlib('cache'),
        goDbHome = false,
        goToParentDocId = '',
        minLevel = 1000;

    $('.doc-container input.ck:checked').each(function() {
        var id = $(this).val(),
            parentId = $(this).attr('data-parent-id'),
            level = $(this).data('level');

        if (id) {
            ids.push(id);
        }

        if (level == 0) {
            goDbHome = true;
        } else if (level < minLevel) {
            goToParentDocId = parentId;
            minLevel = level;
        }
    });
    
    if (!ids.length) {
        utilsLib.showWarning('Please select at least one doc');
    } else {
        var structure = cacheLib.get_cached_mm(app, app.infos.model.id);
        $('#dialog-bloc').trigger('confirmDelete', [{
            ids: ids,
            isRef: structure.isref,
            success: function() {
                if (goDbHome) {
                    $('#db-details-container').trigger('dbHome');
                } else {
                    $('#model-content').trigger('viewDoc', [{id : goToParentDocId}]);
                }
            }
        }]);
    }
    return false;
};
