function() {
    var valCk = ($(this).attr('checked') == 'checked') ? 'checked' : null;
    $(':checkbox').each(function() {
        $(this).attr('checked', valCk);
    });
}