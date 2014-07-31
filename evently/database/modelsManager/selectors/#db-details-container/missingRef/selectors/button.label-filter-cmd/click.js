function(e) {
    var filter = $('.missing-ref-filter').val(),
        lines = $('#missing-references tbody tr'),
        label;

    lines.each(function() {
        label = $(this).find('.missing-label').html().trim();
        if (filter == '') {
            $(this).show();
            return;
        }
        if (label.toLowerCase().indexOf(filter.toLowerCase()) >= 0) {
            $(this).show();
        } else {
            $(this).hide();
        }
    });
}