function(e) {
    // hit Return to submit the form (otherwise "cancel" is triggered... wtf?)
    var key = e.keyCode || e.which;
    if (key == 13) {
        e.preventDefault();
        $('#edit-query-form').submit();
        return false;
    }
}