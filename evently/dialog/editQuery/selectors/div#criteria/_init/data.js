function (e, query, mm) {
    var app = $$(this).app,
        cache = app.getlib('cache'),
        utils = app.libs.utils,
        queriesByMm = e.data.args[4],
        criteria = [],
        // @TODO some major operators don't work anymore (wtf?) and are temporarily disabled for certain types:
        // "equals" and "different from" for types "text", "longtext", "url" and "ref"
        // "starts with" and "does not start with" for type "text", "longtext", "url" and "ref"
        // "ends with" and "does not end with" for types "text", "longtext", "url" and "ref" (only types allowed for this operator, btw)
        ops = [{
                name: '= equals',
                value: 'equals',
                // before: no 'types' key (all types allowed)
                types: ['enum', 'multi-enum', 'date', 'time', 'integer', 'float', 'range', 'geoloc', 'boolean', 'multi-text']
            },{
                name: '≠ different from',
                value: '-equals',
                // before: no 'types' key (all types allowed)
                types: ['enum', 'multi-enum', 'date', 'time', 'integer', 'float', 'range', 'geoloc', 'boolean', 'multi-text']
            },{
                name: '≈ contains',
                value: 'contains',
                types: ['text', 'longtext', 'url', 'enum', 'multi-enum', 'ref', 'multi-text']
            },{
                name: '≉ does not contain',
                value: '-contains',
                types: ['text', 'longtext', 'url', 'enum', 'multi-enum', 'ref', 'multi-text']
            },{
                name: '^ starts with',
                value: 'startswith',
                // types: ['text', 'longtext', 'url', 'date', 'time', 'ref', 'geoloc']
                types: ['date', 'time', 'geoloc']
            },{
                name: '!^ does not start with',
                value: '-startswith',
                // types: ['text', 'longtext', 'url', 'date', 'time', 'ref', 'geoloc']
                types: ['date', 'time', 'geoloc']
            },/*{
                name: '$ ends with',
                value: 'endswith',
                types: ['text', 'longtext', 'url', 'ref']
            },{
                name: '!$ does not end with',
                value: '-endswith',
                types: ['text', 'longtext', 'url', 'ref']
            },*/{
                name: '[] in range',
                value: 'range',
                types: ['text', 'longtext', 'url', 'date', 'time', 'ref', 'integer', 'float', 'range', 'geoloc']
            },{
                name: '][ not in range',
                value: '-range',
                types: ['text', 'longtext', 'url', 'date', 'time', 'ref', 'integer', 'float', 'range', 'geoloc']
            },{
                name: '< lower than',
                value: 'lower',
                types: ['text', 'longtext', 'url', 'date', 'time', 'ref', 'integer', 'float', 'range', 'geoloc']
            },{
                name: '> greater than',
                value: 'greater',
                types: ['text', 'longtext', 'url', 'date', 'time', 'ref', 'integer', 'float', 'range', 'geoloc']
            },{
                name: '∅ empty',
                value: '-notempty'
            },{
                name: '!∅ not empty',
                value: 'notempty'
            },{
                name: '⇒ in subquery (join)',
                value: 'xmm',
                types: ['ref']
    }];

    // return a copy of op with selected element
    function get_ops(op, type) {
        var ret = [];
        for (var i = 0; i < ops.length; i++) {
            var cop = ops[i];
            if (!cop.types || (cop.types.indexOf(type) > -1)) {
                if (cop.value === op) {
                    ret.push({
                        name: cop.name,
                        value: cop.value,
                        selected: true
                    });
                } else {
                    ret.push(cop);
                }
            }
        }
        return ret;
    }

    for (var i = 0; i < query.$criteria.length; i++) {
        var crit = query.$criteria[i],
            mod = crit.$mod || crit.$modi,
            modt = mm.structure[mod] ? mm.structure[mod][0] : mod,
            field = crit.field,
            label = crit.label || crit.field;

        if (!mm.modules[modt]) { // ignore criterion on non existing module
            continue;
        }

        var fields = mm.modules[modt].fields,
            values = null;

        // get field extra params (type, enum values, ref...)
        for (var f = 0; f < fields.length; f++) {
            if (fields[f].name === crit.field) {
                values = fields[f].values;
                if (fields[f].type == 'boolean') {
                    values = ['true', 'false'];
                }
                // cross mm
                if (crit.op == 'xmm') {
                    values = queriesByMm[fields[f].mm].map(function(e) {
                        return {
                            text: e.name,
                            value: e._id
                        }
                    });
                }
                // wtf?
                crit.mm_ref_id = fields[f].mm;
                crit.type = fields[f].type;
                break;
            }
        }
        if (values) { // select correct value
            values = values.map(function(e) {
                var selected = false;
                if (utils.is_array(crit.value)) {
                    if (utils.is_object(e)){
                        selected = (crit.value.indexOf(e.value) > -1);
                    } else {
                        selected = (crit.value.indexOf(e) > -1);
                    }
                } else {
                    if (utils.is_object(e)){
                        selected = (e.value === crit.value);
                    } else {
                        selected = (e === crit.value);
                    }
                }
                return {
                    v: utils.is_object(e) ? e.value : e,
                    text: utils.is_object(e) ? e.text : e,
                    selected: selected
                };
            });
        }

        if (typeof(field) === 'object') { // $ref
            var fieldName = field[1], 
                fmodi = field[2],
                fieldLabel = field[3];
            field = cache.get_name(app, crit.mm_ref_id, fmodi) + ' (' + fieldName + ')';
            label = cache.get_name(app, crit.mm_ref_id, fmodi) + ' (' + fieldLabel + ')';
            //$.log('Label du champ ref :');
            //$.log(label);
        }

        // input config
        var empty = false,
            select = false,
            multi_select = false,
            range = false;
        if (crit.op) {
            empty = (crit.op.indexOf('notempty') > -1);
            range = (crit.op.indexOf('range') > -1);
        }
        select = (values && values.length && !empty);
        var simpletype = null,
            inputtype = 'text';
        if (crit.type == 'geoloc' || crit.type == 'integer' || crit.type == 'float' || crit.type == 'range') {
            simpletype = 'number';
            inputtype = 'number';
        }
        if (select && crit.type == 'multi-enum') {
            select = false;
            multi_select = true;
        }
        var simple = (!range && !select && !multi_select && !empty);

        criteria.push({
            index: i,
            fname: cache.get_name(app, mm._id, mod),
            field: field,
            label: label,
            type: crit.type,
            simpletype: simpletype,
            inputtype: inputtype,
            mm_ref_id: crit.mm_ref_id,
            ops: get_ops(crit.op, crit.type),
            value: crit.value,
            values: values,
            select: select,
            multi_select: multi_select,
            range: range,
            simple: simple,
            min: crit.min,
            max: crit.max
        });
    }

    return {
        criteria: criteria
    };
}