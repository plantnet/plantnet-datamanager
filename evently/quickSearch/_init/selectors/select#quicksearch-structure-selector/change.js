function(e) {
    var mmId = $(this).find('option:selected').val(),
        moduleSelector = $('select#quicksearch-module-selector');

    // reset modules selector (hide fields and views selector)
    moduleSelector.val('');
    moduleSelector.trigger('change');

    if (mmId == '') {
        moduleSelector.css('display', 'none');
    } else {
        moduleSelector.trigger('_init', mmId);
        moduleSelector.css('display', 'inline');
    }

    return false;
}