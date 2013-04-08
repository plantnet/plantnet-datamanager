function () {
    // try to preselect combo
    $('select.mm-col', this).each(function(i, e) {
        var l = $(e).closest('tr').find('.csv-col').text().trim();
        $('option', e).each(function(j, opt) {
            if ($(opt).data('name') && $(opt).data('name').toLowerCase() == l.toLowerCase()) {
                $(opt).attr('selected', 'selected');
            }
        });
    });
}