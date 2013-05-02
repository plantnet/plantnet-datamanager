function(e) {
    var step2Data = e.data.args[1];

    $('#sync-wizard').trigger('step2', step2Data);
    return false;
}