function(e) {
    var valCk = ($(this).attr('checked') == 'checked') ? 'checked' : null;
    $('.structure-cb').each(function() {
        $(this).attr('checked', valCk);
    });

    return false;
}