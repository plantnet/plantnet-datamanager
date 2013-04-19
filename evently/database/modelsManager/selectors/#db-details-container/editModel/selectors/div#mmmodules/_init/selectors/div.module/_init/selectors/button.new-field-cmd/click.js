function() {

    $('#mmmodules').trigger('save');

    var app = $$(this).app,
        utilsLib = app.getlib('utils'),
        nameInput = $('input[name=newfield]', $(this).parent()),
        name = nameInput.val();

    if (!name || (name.length == 0)) {
        utilsLib.showWarning('Type a name for the new field');
    } else {
        var mm = app.data.mm,
            modt = $(this).attr('data-modt');

        // normalize name
        var normalizedName = app.libs.utils.no_accent(name.toLowerCase());
        // validate name
        var msg;
        if ((msg = utilsLib.validateName(normalizedName)) != null) {
            utilsLib.showError('Field name ' + msg);
            return false;
        }

        // does the name already exist
        $(this).parent().find('label.field-name').each(function() {
            var field = $(this).html();
            if (normalizedName == field) {
                utilsLib.showError('Duplicate field name: "' + normalizedName + '"');
                throw new Error('Field "' + normalizedName + '" is duplicated');
                return false;
            }
        });

        var fields = mm.modules[modt].fields; 
        fields.push({
            name: normalizedName,
            label: name,
            type: 'text',
            default_value: '',
            desc: ''
        });

        $('.fields.editor', $(this).parents('.fields-bloc:first')).trigger('_init');
        nameInput.val('');
        utilsLib.showSuccess('New field added');

        // automatic default label template when adding first field
        if (mm.modules[modt].fields.length == 1) {
            var defaultLabelTemplate = '${' + normalizedName + '}';
            $('#' + modt + 'label_tpl').val(defaultLabelTemplate);
            utilsLib.showInfo('A default label template was created: ' + defaultLabelTemplate);
        }
    }

    return false;
};