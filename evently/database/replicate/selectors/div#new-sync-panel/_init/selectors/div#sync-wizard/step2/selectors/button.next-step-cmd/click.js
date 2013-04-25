function(e) {
    var step2Data = e.data.args[0],
        what = $('input[name="what"]:checked').val(),
        whatPanel = $('#sync-select-what');

    step2Data.what = {
        mode: what
    };

    switch(what) {
        case 'advanced': {
            var structures = [];
            whatPanel.find('tbody tr').each(function() {
                var structure = $(this).find('.structure-cb').attr('checked') == ('checked'),
                    data = $(this).find('.data-cb').attr('checked') == ('checked'),
                    vqd = $(this).find('.vqd-cb').attr('checked') == ('checked');
                if (structure || data || vqd) {
                    structures.push({
                        id: $(this).data('id'),
                        name: $(this).data('name'),
                        structure: structure,
                        data: data,
                        vqd: vqd
                    });
                }
            });
            step2Data.what.structures = structures;
        } break;
        case 'queries': {
            var queries = [];
            whatPanel.find('input.checkbox:checked').each(function() {
                queries.push({
                    id: $(this).data('id'),
                    name: $(this).data('name'),
                    structureName: $(this).data('structure-name')
                });
            });
            step2Data.what.queries = queries;
        } break;
        case 'selections': {
            var selections = [];
            whatPanel.find('input.checkbox:checked').each(function() {
                selections.push({
                    id: $(this).data('id'),
                    name: $(this).data('name')
                });
            });
            step2Data.what.selections = selections;
        } break;
        default: {
            // all
        }
    }

    //$.log('step2Data', what, step2Data);
    $('#sync-wizard').trigger('step3', [step2Data]);

    return false;
}