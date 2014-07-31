function () {
    var app = $$(this).app,
        cacheLib = app.getlib('cache'),
        id = $(this).data('id');

    var structure = cacheLib.get_cached_mm(app, app.infos.model.id);

    $('#dialog-bloc').trigger('confirmDelete', [{
        ids: [id],
        isRef: structure.isref,
        success: function() {
            $.pathbinder.begin();
        }
    }]);

    return false;
}