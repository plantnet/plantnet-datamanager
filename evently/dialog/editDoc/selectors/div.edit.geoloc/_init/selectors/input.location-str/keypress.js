function(e) {

    var key = e.keyCode || e.which;
    if (key == 9) { // Tab
        if (e.shiftKey) {
            e.preventDefault();
            $(this).parent().parent().parent().find('input.lat').focus();
        }
    }
};