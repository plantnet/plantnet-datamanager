function(e) {
    // hit Return to add the new field
    var key = e.keyCode || e.which;
    if (key == 13) {
        $('a.add-extra-field-cmd').trigger('click');
        return false;
    }
}