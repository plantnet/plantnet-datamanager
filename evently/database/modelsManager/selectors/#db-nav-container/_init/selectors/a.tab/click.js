function(e) {
    $('.nav-tabs .active').removeClass('active');
    $(this).parent('li').addClass('active');

    var infos = $$(this).app.infos;
    infos.model.name = $(this).data('mm-name');
    infos.model.id = $(this).data('mm-id');
    infos.model.isRef = $(this).data('is-ref');

    $('#models-toolbar-container').trigger('_init');
    
}