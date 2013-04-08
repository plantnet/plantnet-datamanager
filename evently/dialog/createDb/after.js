function() {
    $('#create-db-modal').on('shown', function() {
        $('input[name="dbname"]', this).focus();
    });
    
    $('#create-db-modal').on('keypress', function(event) {
        if (event.which == 13) {
            event.preventDefault();
            $('#create-db-modal form').trigger('submit');
        }
    });
};