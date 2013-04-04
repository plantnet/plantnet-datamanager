function() {
    $('#new-mm-modal').on('shown', function() {
        $('input[name="mm_name"]', this).focus();
    });
}