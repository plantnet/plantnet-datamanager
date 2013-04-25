function(e) {
    $(this).parent().parent().find('input[type="checkbox"]').each(function() {
        $(this).attr('checked', 'checked');
    });

    return false;
}