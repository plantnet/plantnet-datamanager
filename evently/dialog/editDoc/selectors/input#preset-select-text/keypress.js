function(e) {
    // hit Return to load selected preset
    var key = e.keyCode || e.which;
    if (key == 13) {
        e.preventDefault();
        if ($('a.load-preset-cmd')) {
            $('a.load-preset-cmd').trigger('click');
        }
        return false;
    }
}