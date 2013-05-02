function(e) {
    var step3Data = e.data.args[1];

    $('#sync-wizard').trigger('step3', step3Data);
    return false;
}