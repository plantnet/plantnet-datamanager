function(e) {
    // new modi
    var app = $$(this).app,
        utilsLib = app.getlib('utils'),
        mm = app.data.mm;

    var modt = $('#modt-to-add option:selected').val(),
        selectedInputs = $('#mmstructure').find('input.selected-field:checked'),
        pmodi = false;

    if (selectedInputs.length > 1) {
        utilsLib.showWarning('Select zero or one module instance');
        return false;
    } else {
        selectedInputs.each(function() {
            var selectedRow = $(this).closest('tr');
            pmodi = selectedRow.attr('data-modi');
        });
    }
    
    selectedInputs.attr("checked", false);

    if(modt) {
        var new_id = (pmodi ? pmodi : '') + '.' + modt;
        if(mm.structure[new_id]) {
            utilsLib.showError('Link already exists !');
        } else {
            mm.structure[new_id] = [modt, pmodi];
            $("#mmstructure").trigger("_init");
        }
    }
    return false;
}