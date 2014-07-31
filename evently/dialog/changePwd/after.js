function() {
    $('#change-pwd-modal').on('shown', function() {
        $('input[name="pwd"]', this).focus();
    });
}