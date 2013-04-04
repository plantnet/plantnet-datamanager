function() {
    var app = $$(this).app,
        queryLib = app.getlib('query');
    // init ref data

    queryLib.triggerLuceneIndex(app.db);

    $('#dialog-bloc').trigger('busy', [
        ['Checking data...', 
         'This may take several minutes if you updated the application, imported or synchronized data recently.',
         'Please wait until the process completes.'],
        'Initialization']);
    $('#busy-modal').modal('show');

    app.db.dm('check_data', null, null, function() {
        app.db.dm('update_views', null, null, function() {}, function(e) {});

        app.db.dm('up_changes', null, null, function(d) {
            $('#busy-modal').modal('hide');
        }, function(e) {
            $.log('error in up_changes', e);
            $('#busy-modal').modal('hide');
        });
    }, function(e) {
        $.log('error in check_data', e);
        $('#busy-modal').modal('hide');
    });
}