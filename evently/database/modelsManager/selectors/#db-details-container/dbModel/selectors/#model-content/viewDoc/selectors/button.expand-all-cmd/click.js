function() {
    // expand all docs containers
    var buttons = $('.doc-container button.toggle-cmd');

    buttons.each(function() {
        if ($(this).hasClass('collapsed')) {
            $(this).trigger('click');
        }
    });

    return false;
}