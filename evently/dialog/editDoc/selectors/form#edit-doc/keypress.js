function(e) {
    // hit Return to activate "Save and close"
    // hit Ctrl+Return to activate "Save and new"
    // hit Ctrl+Space to load preset
    var key = e.keyCode || e.which;
    if (key == 13) {
        if (e.ctrlKey) {
            e.preventDefault();
            if ($('#savenew')) {
                $('#savenew').trigger('click');
            }
            return false;
        }
    } else if (key == 32) {
        if (e.ctrlKey) {
            e.preventDefault();
            $('a.load-preset-cmd').trigger('click');
        }
    }
}