function(e) {
    var app = $$(this).app,
        utilsLib = app.getlib('utils'),
        active = $(this).hasClass('active');

    if (active) {
        $(this).removeClass('active');
        utilsLib.showInfo('Synonyms will now be hidden');
    } else {
        $(this).addClass('active');
        utilsLib.showInfo('Synonyms will now be shown');
    }

    /*var ac = $('input.editw.ref', this);
    ac.flushCache(); // ça flushe rien du tout cette m**de
    $.log('cache fluché!');*/
}