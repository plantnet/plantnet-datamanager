function() {
	var parent = $(this).parent('div'),
		fieldName = parent.attr('data-name'),
        fieldLabel = parent.attr('data-field-label'),
        mandatory = parent.data('mandatory'),
        defaultValue = parent.attr('data-default-value');

    parent.append('<input type="text" class="editmt" value="' + defaultValue + '" />');
    return false;
}