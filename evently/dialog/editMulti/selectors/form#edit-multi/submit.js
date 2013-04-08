function (e,a,b,c) {
    var app = $$(this).app,
        utilsLib = app.getlib('utils');

    var ids = e.data.args[1],
        trigger = e.data.args[2];

    var field_name = $("#field-name", this).val().trim(),
        field_value = $("#field-value", this).val().trim(),
        fields = {};

    if (!field_name) {
        utilsLib.showError('Empty field name');
        return false;
    }

    try {
        field_value = $.parseJSON(field_value);
    } catch (x) {
    }

    fields[field_name] = field_value;

    utilsLib.showBusyMsg('Applying changes', 'bulkEdit');

    function onSuccess (resp) {
        if (trigger) {
            trigger.trigger();
        } 
        utilsLib.showSuccess('Data saved');
        $('#edit-multi-modal').modal('hide');
    }

    function onError (err) {
        utilsLib.hideBusyMsg('bulkEdit');
        
        if(err && err.responseText) { 
            err = err.responseText; 
            try {
                err = JSON.parse(err);
                err = err.error;
            } catch (Exception) {
                //$.log(err, Exception);
            }
        }
        utilsLib.showError('Unable to save doc, please retry later (' + JSON.stringify(err) + ')');
    }

    app.db.dm('datamanager/bulk_edit', { 
        doc_ids: [ids],
        fields: JSON.stringify(fields)
    }, null, onSuccess, onError);

    return false;
}