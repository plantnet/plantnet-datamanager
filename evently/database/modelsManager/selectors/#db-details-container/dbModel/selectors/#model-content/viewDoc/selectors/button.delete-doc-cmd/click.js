function() {
    var ids = [],
        goDbHome = false,
        goToParentDocId = '',
        minLevel = 1000;

    var utilsLib = $$(this).app.getlib('utils');

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
        var answer = confirm ('Delete doc and subdocs ?');
        if (answer) {
            var app = $$(this).app,
                docLib = app.getlib('doc'),
                utilsLib = app.getlib('utils'),
                onError = utilsLib.showError,
                onSuccess = function() {
                    if (goDbHome) {
                        $('#db-details-container').trigger('dbHome');
                    } else {
                        $.log('goToParentDocId:'+goToParentDocId);
                        $('#model-content').trigger('viewDoc', [{id : goToParentDocId}]);
                    }
                    utilsLib.showSuccess('Doc and sons deleted');
                };

            docLib.delete_with_sons(app.db, ids, onSuccess, onError);
        }
    }
    return false;
};
