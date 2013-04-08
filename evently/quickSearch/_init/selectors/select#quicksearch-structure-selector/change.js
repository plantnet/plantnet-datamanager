function(e) {
    var mmId = $(this).find('option:selected').val(),
        moduleSelector = $('select#quicksearch-module-selector');

    moduleSelector.trigger('_init', mmId);

    if (mmId == '') {
        moduleSelector.css('display', 'none');
    } else {
        moduleSelector.css('display', 'inline');
    }

    return false;
}