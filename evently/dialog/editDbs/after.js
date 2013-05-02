function() {
    var app = $$(this).app;
    
    $('#edit-dbs-modal').modal({ backdrop: 'static' });
    
    $('#edit-dbs-modal').on('shown', function() {
        $('input[name="name"]', this).first().focus();
        
        var externalLinksNumber = $('.ext-link').length;
        if (externalLinksNumber != 0) {
            $('#external-links').removeClass('hide');
            $('#no-link-info').addClass('hide');
        } else {
            $('#external-links').addClass('hide');
            $('#no-link-info').removeClass('hide');
        }
    });

    // Update database external links list in Replicate view
    $('#edit-dbs-modal').on('hidden', function() {
        if (app.data.trigger) {
            app.data.trigger.trigger();
        }
    });
};