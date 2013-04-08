function() {
    var valCk = ($(this).attr('checked') == 'checked') ? 'checked' : null;

    $('#root input.ck').each(function() {
        $(this).attr('checked', valCk);
    });
}