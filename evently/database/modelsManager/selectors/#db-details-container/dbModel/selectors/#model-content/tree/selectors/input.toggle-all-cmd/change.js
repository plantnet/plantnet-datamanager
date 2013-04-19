function() {
    var valCk = ($(this).attr('checked') == 'checked') ? 'checked' : null;

    $('#root input.ck[value!=""]').each(function() {
        $(this).attr('checked', valCk);
    });
}