function() {
    var app = $$(this).app,
    utilsLib = app.getlib('utils'),
    parentId = $(this).attr('data-parent'),
    modi = $(this).attr('data-modi'),
    mm_id = $(this).attr('data-mm-id'),
        parentModi = modi.substr(0, modi.lastIndexOf('.'));
    
    var newParam = {
        parent: parentId,
        parent_modi: parentModi,
        mm_id: mm_id,
        modi: modi
    };
    
    $('#dialog-bloc').trigger('editDoc', [undefined, newParam]);
    
    return false;
}