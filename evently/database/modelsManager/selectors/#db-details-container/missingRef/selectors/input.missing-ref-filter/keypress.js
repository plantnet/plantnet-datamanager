function(e) {
    // return key triggers filtering
    var key = e.keyCode || e.which;
    if (key == 13) {
        $('button.label-filter-cmd').trigger('click');
        e.preventDefault();
        return false;
    }
}