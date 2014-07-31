function() {
    var app = $$(this).app;

    // Update database external links list in Replicate view
    if (app.data.trigger) {
        app.data.trigger.trigger();
    }

    $('#edit-dbs-modal').modal('hide');
}