function(e) {
    var valCk = ($(this).attr('checked') == 'checked') ? 'checked' : null;
    $('.data-cb').each(function() {
        $(this).attr('checked', valCk);
    });

    return false;
}