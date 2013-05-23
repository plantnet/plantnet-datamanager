function(e) {
    // hitting "Return" adds the new field
    var key = e.keyCode || e.which;
    if (key == 13) {
        $(this).parent().find('button.new-field-cmd').trigger('click');
        e.preventDefault();
        return false;
    }
}