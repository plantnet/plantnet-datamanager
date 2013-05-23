function() {
    // reinit param form
    $('#mmmodules').trigger('save');

    var divFields = $(this).closest('div.fields');
    divFields.trigger('_init');
    return false;
};