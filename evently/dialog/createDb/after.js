function() {
    $('#create-db-modal').on('shown', function() {
        $('input[name="dbname"]', this).focus();
    });
};