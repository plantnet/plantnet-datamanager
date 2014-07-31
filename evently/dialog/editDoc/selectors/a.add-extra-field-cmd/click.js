function(e) {
    var app = $$(this).app,
        utilsLib = app.getlib('utils'),
        doc = e.data.args[0],
        struct = e.data.args[1],
        keyElement = $('#extra-field-key'),
        valueElement = $('#extra-field-value'),
        key = keyElement.val(),
        value = valueElement.val(),
        element = $('#extra-data-toggle-cmd'),
        extraFields = $(".extra-field");

    if (key && value) {
        // check for forbidden characters
        if (! key.match(/^[^ ]+$/)) {
            utilsLib.showError('Error: forbidden chars in key');
            return false;
        }
        // check that the key doesn't exist in the mm or the doc
        var found = false;
        for (var i=0; i < struct.modules[doc.$modt].fields.length; i++) {
            found = (found || (struct.modules[doc.$modt].fields[i].name == key));
        }
        extraFields.each(function() {
            found = (found || ($(this).find('label span').text().trim() == key));
        });
        if (found) {
            utilsLib.showError('Error: field "' + key + '" already exists in this document');
            return false;
        }

        // append field
        element.before('<div class="control-group extra-field">'
          + '<label id="' + key + '" class="control-label" for="' + key + '">'
          + key
          + '</label>'
          + '<div class="controls">'
          + '<div id="field-' + key + '" class="edit text field-input" data-field-label="' + key + '" data-name="' + key + '" data-type="text">'
          + '<input id="' + key + '" class="editw" type="text" value="' + value + '">'
          + '</div>'
          // cracra onclick event because elements added to DOM are not managed by
          // previously defined evently selectors !!?? Maybe with $.createElement()
          // instead of HTML en pâté ?
          + ' <a class="btn btn-danger btn-small remove-extra-field-cmd" onclick="$(this).closest(\'div.control-group\').remove();">x</a>'
          + '</div>'
          + '</div>');

        // reset form
        keyElement.val('');
        valueElement.val('');
    }
}