function(e) {
    // hit Return to submit the form (otherwise "delete field" is triggered... wtf?)
    var key = e.keyCode || e.which;
    if (key == 13) {
        e.preventDefault();
        $('#edit-view-form').submit();
        return false;
    }
}