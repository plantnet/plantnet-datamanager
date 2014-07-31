function(e) {
    var mmId = $('select#quicksearch-structure-selector').find('option:selected').val(),
        mod = $(this).find('option:selected').val(),
        fieldSelector = $('select#quicksearch-field-selector'),
        viewSelector = $('select#quicksearch-view-selector'),
        ssContainer = $('.subselectors-container');

    // reset fields and views selectors
    fieldSelector.val('');
    viewSelector.val('');

    if (mod == '') {
        fieldSelector.css('display', 'none');
        viewSelector.css('display', 'none');
        ssContainer.css('display', 'none');
    } else {
        fieldSelector.trigger('_init', [mmId, mod]);
        viewSelector.trigger('_init', mmId);
        fieldSelector.css('display', 'inline');
        viewSelector.css('display', 'inline');
        ssContainer.css('display', 'inline-block');
    }

    return false;
}