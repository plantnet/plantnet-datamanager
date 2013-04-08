function () {
    // propagate "checked" to "true" on save, even if widget hasn't been clicked
    $('input.bool-value:checked', this).trigger('change');
}