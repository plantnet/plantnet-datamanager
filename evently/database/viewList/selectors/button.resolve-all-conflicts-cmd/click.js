function(e) {
    var app = $$(this).app,
        utilsLib = app.getlib('utils');

    var message = 'Conflicts between different revisions will be automatically solved'
        // + ' based on their last modification date'
        + '.\n'
        + 'Unique id conflicts will not be affected.\n'
        + 'Beware that this may lead to unexpected results.\n\n'
        + 'Are you sure?';

    if (confirm(message)) {
        app.db.dm('resolve_all_conflict', null, null, function(data) {
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