function(e) {
    var valCk = ($(this).attr('checked') == 'checked') ? 'checked' : null;
    $('table input.cb-group').each(function() {
        $(this).attr('checked', valCk);
    });
}