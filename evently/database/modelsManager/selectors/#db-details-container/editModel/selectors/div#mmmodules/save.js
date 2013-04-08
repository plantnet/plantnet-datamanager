function() {
    var app = $$(this).app,
        utilsLib = app.getlib('utils'),
        cdoc = app.data.mm;

    function parseTypeParam(that, t, field) {
        if (t === 'enum' || t === 'multi-enum') {
            var values = $('input.values', that).val() || '';

            if (values) {
                try {
                    values = JSON.parse(values)
                }
                catch(Exception) {
                    values = [];
                }
            }

            // for (var i = 0; i < values.length; i++) {
            //     values[i] = $.trim(values[i]);
            // }
            if (values == '') {
                values = [];
            }
            field.values = values;

        } else if (t === 'range') {
            var min = $('input.range-min', that).val() || 0,
                max = $('input.range-max', that).val() || 100,
                step = $('input.range-step', that).val() || 1;
            field.min = JSON && JSON.parse(min) || $.parseJSON(min);
            field.max = JSON && JSON.parse(max) || $.parseJSON(max);
            field.step = JSON && JSON.parse(step) || $.parseJSON(step);
        } else if (t === 'float') {
            var min = $('input.float-min', that).val() || null,
                max = $('input.float-max', that).val() || null,
                step = $('input.float-step', that).val() || null;
            if (min) {
                field.min = JSON && JSON.parse(min) || $.parseJSON(min);
            }
            if (max) {
                field.max = JSON && JSON.parse(max) || $.parseJSON(max);
            }
            if (step) {
                field.step = JSON && JSON.parse(step) || $.parseJSON(step);
            }
        } else if (t === 'ref') {
            var v = $('select.mm', that).val(),
                f = ($('input.ref-force-eoo', that).attr('checked') == 'checked');
            field.mm = v;
            field.force_eoo = f;
        }
    }
   
    // main data
    var doc = {
        _id: cdoc._id, 
        _rev: cdoc._rev, 
        $type: 'mm',
        $locked: cdoc.$locked,
        isref: cdoc.isref
    };

    doc.name = $('#mm_name').val();
    doc.desc = $('#mm_desc').val();

    // modules
    var orderCpt = 0;
    doc.modules = {};
    $('div.module.editor').each(function() {
        var modId = $(this).attr('id'),
        name = $('#' + modId + 'name', this).val(),
        desc = $('#' + modId + 'desc', this).val(),
        indexTpl = $('#' + modId + 'index_tpl', this).val(),
        labelTpl = $('#' + modId + 'label_tpl', this).val(),
        withAttchs = $('#' + modId + 'withattchs', this).is(':checked'),
        color = $('#' + modId + 'color', this).val();

        doc.modules[modId] = {};
        doc.modules[modId].name = name;
        if (desc) doc.modules[modId].desc = desc;
        if (withAttchs) doc.modules[modId].withattchs = withAttchs;
        if (indexTpl) doc.modules[modId].index_tpl = indexTpl;
        if (labelTpl) doc.modules[modId].label_tpl = labelTpl;
        if (color) doc.modules[modId].color = color;
        
        doc.modules[modId].order = orderCpt;
        doc.modules[modId].fields = [];
        
        orderCpt ++;
        
        // fields
        $(this).find('table.fields tbody tr').each(function() {
            var nameField = $('.field-name', this).text(),
                label = $('input[name="label"]', this).val(),
                mandatory = $('input.mandatory', this).attr('checked') == 'checked' ? true : false,
                typeField = $('select[name="type"]', this).val(),
                defaultValue = $(':input[name="default_value"]', this).val(),
                descField = $('textarea[name="desc"]', this).val(),
                needJsonParsing = ['integer', 'float', 'range'];
            
            // Managing default value
            if (typeField == 'boolean') {
                defaultValue = $('input[name="' + nameField + '_default_value"]:checked', this).val();
                if (defaultValue == 'true') {
                    defaultValue = true;
                } else if (defaultValue == 'false') {
                    defaultValue = false;
                } else if (defaultValue == '') {
                    defaultValue = undefined;
                }
            } else if (typeField == 'multi-enum' && $('input.ck:checked', this).length > 0) {
                defaultValue = [];
                $('input.ck:checked', this).each(function() {
                    defaultValue.push($(this).val());
                });
                defaultValue = defaultValue.join(',');
            } else if (typeField == 'geoloc') {
                var lng = $('input.lng.loc', this).val(),
                    lat = $('input.lat.loc', this).val();
                if (lng && lat) {
                    defaultValue = [lng, lat];
                }
            } else if (typeField == 'float' || typeField == 'range') {
                defaultValue = parseFloat(defaultValue);
            } else if (typeField == 'integer') {
                defaultValue = parseInt(defaultValue);
            }
            
            nameField = nameField.trim();
            
            var field = {
                name: nameField, 
                label: label,
                mandatory: mandatory,
                type: typeField,
                default_value: defaultValue,
                desc: descField, 
            };
            
            parseTypeParam(this, typeField, field);
            doc.modules[modId].fields.push(field);
        });
    });
    
    // structure
    doc.structure = cdoc.structure;
    
    app.data.mm = doc;
};