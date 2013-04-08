function() {
    var app = $$(this).app,
        mm = app.data.mm,
        modt = $(this).attr('id'),
        module = mm.modules[modt],
        fields = module.fields,
        types = ['text', 'integer', 'float', 'boolean', 'date', 'time', 'url', 
                 'geoloc', 'longtext', 'ref', 'enum', 'multi-enum', 'range'];

    // adapt field type for combo box
    for (var i = 0; i < fields.length; i++) {
        // TODO : voir pourquoi ce continue!
        if (!fields[i]) { continue; }

        var actualFieldType = fields[i].type,
            paramTypeField = 'is_' + actualFieldType;
        if (actualFieldType == 'boolean') {
            var defaultBoolValue = {name: fields[i].name, is_null: true};
            
            if (fields[i].default_value === true ) {
                defaultBoolValue = {name: fields[i].name, is_true: true};
            } else if (fields[i].default_value === false ) {
                defaultBoolValue = {name: fields[i].name, is_false: true};
            }
            
            fields[i][paramTypeField] = defaultBoolValue;
        } else if (actualFieldType == 'ref') {
            fields[i][paramTypeField] = { force_eoo: fields[i].force_eoo };
        } else if (actualFieldType == 'enum') {
            var enumValues = fields[i].values,
                enumDefaultValue = fields[i].default_value,
                values = [];

            // stringyfy list to keep format
            fields[i].values = JSON.stringify(fields[i].values);

            values.push({value: '', txt: 'Select a value', selected: '' === enumDefaultValue});
            for (var j = 0; j < enumValues.length; j++) {
                values.push({
                    value: enumValues[j],
                    txt: enumValues[j],
                    selected: enumValues[j] === enumDefaultValue
                });
            }
            fields[i][paramTypeField] = {values: values};
        } else if (actualFieldType == 'multi-enum') {
            var multiEnumValues = fields[i].values,
                values = [],
                multiEnumDefaultValue = [];
            
            // stringify list to keep format
            fields[i].values = JSON.stringify(fields[i].values);


            if (fields[i].default_value) {
                if (typeof fields[i].default_value == 'string') {
                    multiEnumDefaultValue = fields[i].default_value.split(',') || [];
                } else {
                    multiEnumDefaultValue = fields[i].default_value;
                }
            }
            for (var j = 0; j < multiEnumValues.length; j++) {
                var actualValue = multiEnumValues[j],
                    checkedOrNot = (multiEnumDefaultValue.indexOf(actualValue) >= 0) ? true : false;
                values.push({
                    value: actualValue, 
                    checked: checkedOrNot
                });
            }
            
            fields[i][paramTypeField] = {values: values};
        } else if (actualFieldType == 'geoloc' && fields[i].default_value) {
            var geolocDefaultValue = fields[i].default_value,
                lng = geolocDefaultValue[0],
                lat = geolocDefaultValue[1];
            fields[i][paramTypeField] = {lat: lat, lng: lng};
        } else if (actualFieldType == 'range') {
            var min = fields[i].min || 0,
                max = fields[i].max || 100,
                step = fields[i].step || 1,
                defaultValue = fields[i].default_value || '';
            
            fields[i]['has_range'] = true;
            fields[i][paramTypeField] = {
                default_value: defaultValue, 
                min: min, 
                max: max, 
                step: step
            };
        } else if (actualFieldType == 'float') {
            var min = fields[i].min || null,
                max = fields[i].max || null,
                step = fields[i].step || 'any',
                defaultValue = fields[i].default_value || '';
            fields[i]['has_range'] = true;
            fields[i][paramTypeField] = {
                default_value: defaultValue, 
                min: min, 
                max: max, 
                step: step
            };
        } else if (actualFieldType == 'integer') {
            var defaultValue = fields[i].default_value || '';
            fields[i][paramTypeField] = {
                default_value: defaultValue
            };
        } else {
            fields[i][paramTypeField] = true;
        }
        
        // create type list
        fields[i].types = [];
        for (var j = 0; j < types.length; j++) {
            var o = {
                tname: types[j],
                selected: (types[j] === actualFieldType)
            };
            fields[i].types.push(o);
        }
    }
    
    return {
        has_fields: fields.length > 0 ? true : false,
        fields: fields
    };
};