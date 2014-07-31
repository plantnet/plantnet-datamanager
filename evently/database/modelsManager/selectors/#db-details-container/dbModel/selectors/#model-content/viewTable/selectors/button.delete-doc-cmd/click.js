function(e) {
    var app = $$(this).app,
        utilsLib = app.getlib('utils'),
        cacheLib = app.getlib('cache'),
        ids = [];

    $('table.data .ck:checked').each(function() {
        var id = $(this).val();
        if (id) {
            ids.push(id);
        }
    });

    if (ids.length > 0) {
        var structure = cacheLib.get_cached_mm(app, app.infos.model.id);
        $('#dialog-bloc').trigger('confirmDelete', [{
            ids: ids,
            isRef: structure.isref,
            success: function() {
                $.pathbinder.go($.pathbinder.currentPath().slice(1));
            }
        }]);
    } else {
        utilsLib.showWarning('Please select at least one row');
    }
    return false;
}