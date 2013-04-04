function(e, doc, mm) {
    var fieldName = $(this).attr('data-name'),
        mandatory = $(this).data('mandatory'),
        defaultValue = $(this).attr('data-default-value'),
        value = doc[fieldName] || defaultValue,
        utils = $$(this).app.libs.utils
        editMapId = 'map-' + fieldName.replace(/_/g, '-');

    var lat = null,
        lng = null,
        arrayValue = null;

    if (utils.isNotEmpty(value)) {
        // TODO : corriger ce hack quand le type pour lat lng sera défini
        if (typeof value == 'string') {
            value = value.split(',');   // dirty hack, kept only for existing docs saved as strings
        }
        if (value.length == 2) {
            lng = value[0];
            lat = value[1];
            arrayValue = '[' + lng + ',' + lat + ']';
        }
    }

    return {
        //value: value,
        name: fieldName,
        edit_map_id: editMapId,
        required: mandatory,
        lat: lat,
        lng: lng,
        array_value: arrayValue
    };
};