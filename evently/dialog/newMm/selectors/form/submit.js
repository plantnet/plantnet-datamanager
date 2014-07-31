function() {
    var app = $$(this).app,
        utilsLib = app.getlib('utils'),
        mmLib = app.getlib('mm'),
        name = $('input[name="mm_name"]').val(),
        desc = $('textarea[name="mm_desc"]').val(),
        isRef = $('input[name="mm_is_ref"]').attr('checked'),
        newId = $.couch.newUUID(),
        mm = {
            _id: '_design/mm_' + newId,
            $type: 'mm',
            name: name,
            isref: isRef,
            desc: desc,
            modules: {},
            structure: {},
            types: {}
        };

    mmLib.validate_mm(mm, app);

    var existingModels = [];
    $('#db-nav-container *[data-mm-name]').each(function() {
        existingModels.push($(this).data('mm-name').toLowerCase());
    });

    if (existingModels.indexOf(name.toLowerCase()) == -1) {
        app.db.saveDoc(mm, {
            success: function(newMm) {
                utilsLib.showSuccess('New structure created');
                $('#db-nav-container').trigger('_init');
                $.pathbinder.go('/editmm/' + newMm.id.slice(8));
            },
            error: function() {
                utilsLib.showError('Cannot create new structure');
            }
        });
    } else {
        utilsLib.showError('A structure named "' + name + '" already exists');
    }

    $('#new-mm-modal').modal('hide');
    return false;
}