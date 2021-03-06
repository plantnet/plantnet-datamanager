function (doc, mm, presets, parent_id, parent_label, parent_modi, synonym_label) {

    var app = $$(this).app,
        cacheLib = app.getlib('cache'),
        module = mm.modules[doc.$modt],
        docLabel = doc.$label,
        hasLabelTpl = !!docLabel,
        hasMandatoryFields = false,
        hasDescForFields = false;
        added_fields = {};
        fields = [];

    for (var index = 0; index < module.fields.length; index++) {
        var mfield = module.fields[index],
            isMandatory = mfield.mandatory || false,
            hasDesc = mfield.desc ? true : false,
            hasMin = (mfield.min == 0 || mfield.min) ? true : false,
            hasMax = (mfield.max == 0 || mfield.max) ? true : false,
            hasStep = mfield.step ? true : false,
            field = {};
        
        if (isMandatory) {
            hasMandatoryFields = true;
        }
        if (hasDesc) {
            hasDescForFields = true;
        }

        added_fields[mfield.name] = true;
        field = {
            index: index,
            name: mfield.name,
            label: mfield.label || mfield.name,
            has_desc: hasDesc,
            description: mfield.desc || '',
            mandatory: isMandatory,
            is_serial: mfield.is_serial,
            type: mfield.type,
            is_geoloc: (mfield.type == 'geoloc'),
            default_value: mfield.default_value,
            has_min: hasMin,
            min: mfield.min,
            has_max: hasMax,
            max: mfield.max,
            has_step: hasStep,
            step: mfield.step
        };

        fields.push(field);
    }

    // add here extra fields
    var hasextra = false;
    for (var key in doc) {
        if (key[0] === '_' || key[0] === '$' || added_fields[key]) { continue; }
        fields.push({name:key, label:key, type:"text", extra:true});
        hasextra = true;
    }


    var availablePresets = [];
    for (tpl in presets) {
        availablePresets.push({
            name: tpl
        });
    }

    return { 
        parent_label: parent_label,
        synonym_label: synonym_label,
        parent_id: parent_id,
        parent_modi: parent_modi,
        _id: doc._id,
        _rev: doc._rev,
        new_doc: !doc._id,
        attchid: (module.withimg || module.withattchs) && doc._id,
        attch: module.withimg || module.withattchs,
        has_label_tpl: hasLabelTpl,
        doc_label: docLabel,
        editsyn: mm.isref && doc._id,
        module: module,
        modiName: cacheLib.get_name(app, doc.$mm, doc.$modi),
        doc: doc,
        fields: fields,
        presets: availablePresets,
        last_used_preset: app.data.lastUsedPreset,
        has_mandatory_fields: hasMandatoryFields,
        has_desc_fields: hasDescForFields,
        hasextra: hasextra
    };
};