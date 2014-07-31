function() {
    var app = $$(this).app,
        checked = ($(this).attr('checked') == 'checked') ? true : false,
        modi = $(this).data('modi'),
        field = $(this).data('field'),
        mmId = '_design/' + $(this).closest('ul').data('mmid');

    app.layersFilter = app.layersFilter || {};

    if (checked){
        $(this).parent('label').addClass('active');
        app.layersFilter[modi + '-' + field] = {
            modi: modi,
            field: field
        };
    } else {
        $(this).parent('label').removeClass('active');
        delete app.layersFilter[modi + '-' + field];
    }
    $('#geoloc-view-map').trigger('displaypoints', [mmId]);

    // Don't return false or use event.stopPropagation() if you want see the checkbox checked
}