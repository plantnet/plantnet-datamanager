function(e) {
    $('#sync-structures-selection input[type="checkbox"]').each(function() {
        $(this).attr('checked', 'checked');
    });

    return false;
}