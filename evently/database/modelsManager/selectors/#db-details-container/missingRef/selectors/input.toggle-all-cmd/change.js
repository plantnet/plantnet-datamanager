function() {
    var valCk = ($(this).attr('checked') == 'checked') ? 'checked' : null;
    $('#missing-references table input.ck').each(function() {
        $(this).attr('checked', valCk);
    });
}