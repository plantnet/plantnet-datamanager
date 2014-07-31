function(e) {
    // hit Ctrl+Space to generate new integer
    var key = e.keyCode || e.which;
    if (key == 32) {
        if (e.ctrlKey) {
            e.preventDefault();
            $('a.generate-cmd', this).trigger('click');
            return false;
        }
    }
}