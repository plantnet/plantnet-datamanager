function() {
    var valCk = ($(this).attr('checked') == 'checked') ? 'checked' : null;

    $('.doc-container input.ck').each(function() {
        $(this).attr('checked', valCk);
    });
}