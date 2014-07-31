function() {
    var valCk = ($(this).attr('checked') == 'checked') ? 'checked' : null;
    $('table.data input.ck').each(function() {
        $(this).attr('checked', valCk);
    });
}