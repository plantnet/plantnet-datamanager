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
    // Check multi-text required
    var multiTextRequiredOk = true;
    if ($('.multi-text[data-mandatory="true"]', form).length > 0) {
        $('.multi-text[data-mandatory="true"]', form).each(function() {
            var group = $(this);
            var name = $(this).attr('data-field-label');
            var isValidGroup = false;
            $('input[type="text"]', group).each(function() {
                if ($(this).val().replace(/^\s+/g,'').replace(/\s+$/g,'') != '') {
                    isValidGroup = true;
                }
            });
            if (!isValidGroup) {
                multiTextRequiredOk = false;
                utilsLib.showWarning('Please put a value for "' + name + '" field');
            }
        });
    }

    if (multiEnumRequiredOk && multiTextRequiredOk) {
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
                $('#dialog-bloc').trigger('editDoc', [undefined, new_param, trigger]);
            } else if (action == 'attch') {
                // save and attach
                utilsLib.showBusyMsg('Loading the dialog for edit file', 'editFile');
                $('#dialog-bloc').trigger('editFile', [resp.id, trigger]);
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
            var fieldType = $(this).closest('div.field-input').data('type'),
                inputValue = $(this).val();

            // do no trim enum
            if (fieldType !== 'enum' && typeof(inputValue) === 'string') {
                inputValue = inputValue.trim();
            }

            // unified method to read widgets value - check that it works here as expected 
            values[this.id] = utilsLib.readWidget(inputValue, fieldType);

            var defaultValue = $(this).parents('.edit').attr('data-default-value');
            //$.log('id', this.id, 'default value', defaultValue, 'values this id', values[this.id]);
            if ((defaultValue == undefined || defaultValue === '') && (values[this.id] === '') || (values[this.id] === null)) {
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
            if ((doc[key] === '' || doc[key] === null) && fieldsToUndeleted.indexOf(key) > -1) {
                delete doc[key];
            } 
        }

        // ref-id
        $(':input.ref-id', form).each(
            function() {
                var refId = $(this).val(),
                    fieldName = $(this).attr('data-field-name');
                doc.$ref = doc.$ref || {};
                doc.$ref[fieldName] = { _id: refId ? refId : null };
            }
        );

        // multi-text
        if ($('.multi-text', form).length > 0) {
            $('.multi-text', form).each(function() {
                var group = $(this);
                var name = $(this).attr('data-name');
                var group_values = [];
                $('input[type="text"]', group).each(function() {
                    var val = $(this).val().replace(/^\s+/g,'').replace(/\s+$/g,'');
                    if (val != '') {
                        group_values.push(val);
                    }
                });
                if (group_values.length > 0) {
                    doc[name] = group_values;
                } else {
                    if (doc[name] || doc[name] != undefined) {
                        delete doc[name];
                    }
                }
            });
        }

        app.db.dm('datamanager/save_doc', { parent: parent_id ? parent_id : 'null' }, doc, onSuccess, onError);
    }

    return false;
}