function() {
    var valCk = ($(this).attr('checked') == 'checked') ? 'checked' : null;
    $('.doc-list :checkbox').each(function() {
        $(this).attr('checked', valCk);
    });
}