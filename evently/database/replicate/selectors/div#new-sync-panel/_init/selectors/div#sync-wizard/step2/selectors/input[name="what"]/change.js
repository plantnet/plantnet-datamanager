function(e) {

    var val = $('input[name="what"]:checked').val(),
        whatPanel = $('#sync-select-what'),
        data = e.data.args[1];

    switch (val) {
        case 'advanced': {
            whatPanel.trigger('advanced', data);
        } break;
        case 'queries': {
            whatPanel.trigger('queries', data);
        } break;
        case 'selections': {
            whatPanel.trigger('selections', data);
        } break;
        default: {
            whatPanel.trigger('empty', []);
        }
    }
}