function(e) {
    // toggle synonyms inclusion in tree
    var app = $$(this).app,
        utilsLib = app.getlib('utils'),
        active = $(this).hasClass('active');

    if (active) {
        $(this).removeClass('active');
        utilsLib.showInfo('Synonyms will be hidden in newly expanded nodes');
    } else {
        $(this).addClass('active');
        utilsLib.showInfo('Synonyms will be shown in newly expanded nodes');
    }
}