function() {
    var app = $$(this).app;

    app.infos.module.instance.addDocPossible = $(this).data('add-doc-possible');

    $('.accordion.model-menu li.active').removeClass('active');
    $(this).parent('li').addClass('active');
}