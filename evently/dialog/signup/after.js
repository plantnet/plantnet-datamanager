function() {
    $('#signup-modal').on('shown', function() {
        $('input[name="name"]', this).focus();
    });
};