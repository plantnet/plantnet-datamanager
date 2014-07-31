function(e) {
    var app = $$(this).app,
        utilsLib = app.getlib('utils');

    var resolve_function = 'resolve_all_conflict';
    var by_date = false;

    if($(this).hasClass('resolve_conflicts_by_date')){
        resolve_function = 'resolve_all_conflict_by_date';
        by_date = true;
    }

    var message = 'Conflicts between different revisions will be automatically solved'
        // + ' based on their last modification date'
        + '.\n'
        + 'Unique id conflicts will not be affected.\n'
        + 'Beware that this may lead to unexpected results.\n\n'
        + 'Are you sure?';

    if (confirm(message)) {
        app.db.dm(resolve_function, null, null, function(data) {
                utilsLib.showSuccess('All revisions conflicts solved');
                $.pathbinder.begin();
            }, function(error) {
                utilsLib.showError('Error resolving conflicts');
                $.pathbinder.begin();
            }
        );
    }

    return false;
}