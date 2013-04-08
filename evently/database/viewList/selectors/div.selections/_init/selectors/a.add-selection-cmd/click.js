function() {
    var app = $$(this).app,
        utilsLib = app.getlib('utils'),
        ids = [];

    $('.ck:checked').each(function() {
       var id = $(this).val();
       ids.push(id); 
   });
    
    if (ids.length == 0) { 
        utilsLib.showWarning('You must select at least one doc.');
    } else {
        var selectionId = $(this).attr('data-selection-id');
        $('#selections').trigger('addToSelection', [selectionId, ids]);
    }
    
    return false;
}