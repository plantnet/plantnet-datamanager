function(e) {
    var $this = $(this),
        ids = [];
    
    $('.doc-list input.ck:checked').each(function() {
        var id = $(this).val();
        if (id) {
            ids.push(id);
        }
    });
    
    if (!ids.length) {
        utilsLib.showWarning('Please select at least one doc');
    } else {
        $('#dialog-bloc').trigger('confirmDelete', [{
            ids: ids,
            isRef: true,
            success: function() {
                $.pathbinder.begin();
            }
        }]);
    }
    return false;
}