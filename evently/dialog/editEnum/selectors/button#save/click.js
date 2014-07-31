function(e) {
    var app = $$(this).app,
        utilsLib = app.getlib('utils'),
        origin = e.data.args[2],
        originInput = origin.parent().find('input');

    var vals = $('form#edit-enum').find('textarea').val();
    vals = vals.split('\n');
    for (var i=0; i < vals.length; i++) {
        if (vals[i] === '') {
            utilsLib.showError('Empty values are forbidden');
            return false;
        }
    }
    vals = vals.unique();
    originInput.val(JSON.stringify(vals));
    // To reinitiate the default value
    originInput.trigger('change');

    $('#edit-enum-modal').modal('hide');
    return false;
}