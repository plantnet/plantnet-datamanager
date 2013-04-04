function(e) {
    // save doc
    var form = $(this),
        app = $$(this).app;
        utilsLib = app.getlib('utils'),
        doc = e.data.args[0],
        mm = e.data.args[1],
        doclib = app.getlib('doc');

    utilsLib.showBusyMsg('Validating doc', 'editDoc');

    // Check multi-enum required because HTML5 required attribute doesn't work correctly
    var multiEnumRequiredOk = true;

    if ($('.ck[data-required="true"]', form).length > 0) {
        var ckGroups = {};
        $('.ck[data-required="true"]', form).each(function() {
            var ckGroupName = $(this).attr('name');
            if (ckGroups[ckGroupName] == undefined) {
                ckGroups[ckGroupName] = {
                    isOk: false,
                    labelField: $(this).attr('data-label')
                };
            }
            if (ckGroups[ckGroupName].isOk == false && $(this).attr('checked') == 'checked') {
                ckGroups[ckGroupName].isOk = true;
            }
        });

        $.each(ckGroups, function(key, value) { 
            if (value.isOk == false) {
                multiEnumRequiredOk = false;
                utilsLib.showWarning('Please check a value for "' + value.labelField + '" field');
            }
        });
    }

    if (multiEnumRequiredOk) {
        // check id
        var parent_id = $('input#parent-id', form).val(),
            parent_deleted = ($('input#parent-deleted', form).val() == 'true');
        if (!parent_id) {
            if (!parent_deleted) {
                var old_parent_id = $('input#parent-id-old', form).val();
                parent_id = old_parent_id;
            }
        }

        // modi change
        var newModi = $('select#new-modi').val();
        if (newModi) {
            doc.$modi = newModi;
        }

        // it's the final callback (we're leaving together)
        function onSuccess(resp) {
            utilsLib.hideBusyMsg('editDoc');

            var trigger = app.data.trigger, 
                action = app.data.action_button;

            if (trigger) {
                if (trigger.param) {
                    trigger.param[0].anchor = resp.id; // focus on new  doc //uiiik
                }
                trigger.trigger(parent_id);
            } else {
                //$.log("pathbinder");
                $.pathbinder.go('/viewdoc/' + resp.id);
            }

            if (action == 'new') {
                var new_param = e.data.args[9]; // save and new
                utilsLib.showBusyMsg('Loading the dialog for edit doc', 'editDoc');
                $('#dialog-bloc').trigger('editDoc', [undefined, new_param, trigger]);
            } else if (action == 'attch') {
                // save and attach
                utilsLib.showBusyMsg('Loading the dialog for edit file', 'editFile');
                $('#dialog-bloc').trigger('editFile', [resp.id, trigger]);
                $.log('finicht', 'edit file');
            }

            utilsLib.showSuccess('Doc saved');

            // always close modal "editDoc"
            $('#edit-doc-modal').modal('hide');
        }

        function onError(err, msg2, msg3) {
            utilsLib.hideBusyMsg('editDoc');
            var errorMsg = null;
            
            if(err && err.responseText) {
                try {
                    var errObject = JSON.parse(err.responseText);
                    errorMsg = errObject.msg;
                    $.log(err)
                } catch (Exception) {
                    errorMsg = err.responseText;
                    //$.log(err, Exception);
                }
            }
            utilsLib.showError('Unable to save doc' + (errorMsg ? ': ' + errorMsg : ''));
        }

        // get the values
        var values = {},
            fieldsToUndeleted = [];

        $(':input.editw', form).each(function() {
            var fieldType = $(this).parent().data('type');
            var inputValue = $(this).val();

            // do no trim enum
            if (fieldType !== 'enum' && typeof(inputValue) === 'string') {
                inputValue = inputValue.trim();
            }

            try {
            
                if (typeof(inputValue) === 'string') {
                    // try to intrepret string
                    values[this.id] = $.parseJSON(inputValue);
                } else {
                    values[this.id] = inputValue; 
                }
            } catch (x) {
                // string
                // try to parse number (JSON.parse fails in case of leading zeroes)
                if (fieldType == 'integer' || fieldType == 'float' || fieldType == 'range') {
                    var num = parseFloat(this.value);
                    if (isNaN(num)) { // foirax
                        values[this.id] = this.value;
                    } else {
                        values[this.id] = num;
                    }
                } else {
                    values[this.id] = this.value;
                }
            }

            var defaultValue = $(this).parents('.edit').attr('data-default-value');
            if ((defaultValue == undefined || defaultValue === '') && values[this.id] === '') {
                fieldsToUndeleted.push(this.id);
            }
        });
    
        for (var key in values) {
            if (key) {
                doc[key] = values[key];
            }
        }

        // remove empty fields
        for (var key in doc) {
            if (doc[key] == '' && fieldsToUndeleted.indexOf(key) > -1) {
                delete doc[key];
            } 
        }

        // ref-id
        $(':input.ref-id', form).each(
            function() {
                var refId = $(this).val(),
                    fieldName = $(this).attr('data-field-name');
                doc.$ref = doc.$ref || {};
                doc.$ref[fieldName] = {_id: refId ? refId : null};
            }
        );

        app.db.dm('datamanager/save_doc', { parent: parent_id ? parent_id : 'null' }, doc, onSuccess, onError);
    }

    return false;
}