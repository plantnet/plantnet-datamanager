function(e) {
    // deactivate "Return" key in the whole form: too dangerous to save model unintentionally
    var key = e.keyCode || e.which;
    if (key == 13) {
        e.preventDefault();
        return false;
    }
}