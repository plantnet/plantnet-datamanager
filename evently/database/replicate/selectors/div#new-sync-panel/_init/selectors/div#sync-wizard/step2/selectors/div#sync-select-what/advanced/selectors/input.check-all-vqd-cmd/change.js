function(e) {
    var valCk = ($(this).attr('checked') == 'checked') ? 'checked' : null;
    $('.vqd-cb').each(function() {
        $(this).attr('checked', valCk);
    });

    return false;
}