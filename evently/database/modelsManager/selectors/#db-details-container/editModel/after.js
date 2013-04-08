function() {
    var utilsLib = $$(this).app.getlib('utils');
    
    $('form input', this).each(function() {
        $(this).bind('invalid', function(e) {
            $(this).parents('.fields-bloc').each(function() {
                $(this).css('display', 'block');
            });
        });
    });

    utilsLib.hideBusyMsg('editMm');
};