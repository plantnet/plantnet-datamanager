function() {
    //var app = $$(this).app;

    $('#edit-dbs-modal').modal({ backdrop: 'static' });

    /*$('#edit-dbs-modal').on('shown', function() { // perturbated by tooltips that fire "shown" each time they appear
        $.log('ON SHOWN');
        $('input[name="name"]', this).first().focus();
        
        var externalLinksNumber = $('.ext-link').length;
        if (externalLinksNumber != 0) {
            $('#external-links').removeClass('hide');
            $('#no-link-info').addClass('hide');
        } else {
            $('#external-links').addClass('hide');
            $('#no-link-info').removeClass('hide');
        }
    });*/
};