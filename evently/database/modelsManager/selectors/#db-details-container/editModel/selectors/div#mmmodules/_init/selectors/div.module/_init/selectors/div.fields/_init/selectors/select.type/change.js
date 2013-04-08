function() {
    // We don't save the default value for this field
    $(this).closest('table.fields tbody tr').find('input[name="default_value"]').val('');
    $(this).closest('table.fields tbody tr').find('select[name="default_value"] option:selected').val('');
    $(this).closest('table.fields tbody tr').find('textarea[name="default_value"]').val('');
    $(this).closest('table.fields tbody tr').find('.default-value-range').remove();

    $('#mmmodules').trigger('save');
    
    var divFields = $(this).closest('div.fields');
    divFields.trigger('_init');
    return false;
};