function(e) {
    var step3Data = e.data.args[1],
        continuous = ($('input[name="continuous"]:checked').val() == 'continuous'),
        includedeleted = ($('input[name="includedeleted"]:checked').val() == 'yes');

    step3Data.continuous = continuous;
    step3Data.includedeleted = includedeleted;

    $('#sync-wizard').trigger('step4', [step3Data]);

    return false;
}