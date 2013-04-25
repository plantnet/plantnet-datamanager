function(e) {
    var step3Data = e.data.args[1],
        continuous = ($('input[name="continuous"]:checked').val() == 'continuous');

    step3Data.continuous = continuous;
    $('#sync-wizard').trigger('step4', [step3Data]);

    return false;
}