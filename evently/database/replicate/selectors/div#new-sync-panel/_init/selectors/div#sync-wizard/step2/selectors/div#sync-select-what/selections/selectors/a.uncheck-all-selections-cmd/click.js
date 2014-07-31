function(e) {
    $(this).parent().find('input.checkbox').each(function() {
        $(this).attr('checked', null);
    });

    return false;
}