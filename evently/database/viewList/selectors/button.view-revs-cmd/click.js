function(e) {
    var utilsLib = $$(this).app.getlib('utils'),
        ids = [];
    
    $('.doc-list input.ck:checked').each(function() {
        var id = $(this).val();
        if (id) {
            ids.push(id);
        } 
    });
    if (ids.length != 1) {
        utilsLib.showWarning('Please select only one doc to see its revisions.');
    } else {
        $.pathbinder.go('/viewrevs/'+ids[0] + '/0');
    }
    return false;
}