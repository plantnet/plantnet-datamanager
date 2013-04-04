function(e) {
    // warning: getting parameters the cracra way

    $('#dialog-bloc').trigger('exportCsvTable', {
        id: e.data.args[0],
        name: e.data.args[1],
        mm_id: e.data.args[2],
        cols: e.data.args[3],
        modi: e.data.args[4],
        skip: e.data.args[6],
        limit: e.data.args[7],
        sort: e.data.args[9],
        filter: e.data.args[11],
        query: e.data.args[12],
        view: e.data.args[13],
        group: e.data.args[14],
        isRef: ($('#mm-is-ref').val() === 'true')
    });

    return false;
}