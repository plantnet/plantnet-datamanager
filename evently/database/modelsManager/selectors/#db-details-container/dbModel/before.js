function(e, modelInfo) {
    $('.nav-tabs li.active').removeClass('active');
    $('.nav-tabs a[data-mm-id="'+modelInfo.mmId+'"]').parent('li').addClass('active');
    
    var infos = $$(this).app.infos;
    infos.model.name = $('.nav-tabs a[data-mm-id="'+modelInfo.mmId+'"]').attr('data-mm-name');
    infos.model.isRef = $('.nav-tabs a[data-mm-id="'+modelInfo.mmId+'"]').data('is-ref');
}