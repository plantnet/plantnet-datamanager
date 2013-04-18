function(e) {
    // delete modi if possible

    var app = $$(this).app,
        utilsLib = app.getlib('utils'),
        mm = app.data.mm,
        selectedInputs = $('#mmstructure').find('input.selected-field:checked');

    var selectedRow,
        isRemovable = false,
        modi = -1;

    if (selectedInputs.length != 1) {
        utilsLib.showWarning('Select exactly one module instance');
        return false;
    } else {
        selectedInputs.each(function() {
            selectedRow = $(this).closest('tr');
            isRemovable = selectedRow.data('removable');
            modi = selectedRow.attr('data-modi');
        });
    }

    var label = mm.modules[mm.structure[modi][0]].name;

    if (! isRemovable) {
        utilsLib.showError('Module "' + label + '" has sons or/and contains documents; delete them first');
        return false;
    }

    // get the number of doc by module
    app.db.view("datamanager/by_mod", {
        key : [mm._id, modi],
        cache : JSON.stringify(new Date().getTime()),
        success : function (data) {
            var nb_doc = 0;
            if (data.rows && data.rows[0]) {
                nb_doc = data.rows[0].value;
            }

            if(nb_doc > 0) {
                utilsLib.showError('Module "' + label + '" is not empty; you cannot remove it.');
            } else {
                // rebuild structure
                delete(mm.structure[modi]);
                $("#mmstructure").trigger("_init");
            }
        }});

    return false;
}