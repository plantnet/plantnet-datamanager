function(e) {
    $(this).parent().find('input.checkbox').each(function() {
        $(this).attr('checked', 'checked');
    });

    return false;
}