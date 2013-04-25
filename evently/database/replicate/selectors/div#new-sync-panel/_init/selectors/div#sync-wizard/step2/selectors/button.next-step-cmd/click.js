function(e) {

    $.log('form 2 submitted!!');
    $('#sync-wizard').trigger('step3', {});

    return false;
}