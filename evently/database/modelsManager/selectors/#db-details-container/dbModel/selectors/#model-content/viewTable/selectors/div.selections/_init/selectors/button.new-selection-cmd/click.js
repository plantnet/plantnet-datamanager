function() {
    var app = $$(this).app,
        utilsLib = app.getlib('utils'),
        ids = [];
    $('.data input.ck:checked').each(function() {
       var id = $(this).val();
       ids.push(id); 
    });
    
    if (ids.length == 0) { 
        utilsLib.showWarning('You must select at least one line to create a new selection');
    } else {
        $('#selections').trigger('addNewSelection', [ids]);
        $('#selections').trigger('_init');
    }
    
    return false;
}