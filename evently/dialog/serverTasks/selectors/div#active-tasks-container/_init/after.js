function() {
    setTimeout(function() {
        var visible = $('#active-tasks-container').is(':visible'); // if dialog is visible
        $.log('is visible : '+ visible);
        if (visible) {
            $('div#active-tasks-container').trigger('_init');
        }
    }, 3000);
}