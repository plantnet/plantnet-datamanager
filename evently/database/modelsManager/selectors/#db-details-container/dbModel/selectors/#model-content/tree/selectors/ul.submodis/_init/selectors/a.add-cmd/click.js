function() {
    var app = $$(this).app,
        utilsLib = app.getlib('utils'),
        parentId = $(this).attr('data-parent'),
        modi = $(this).attr('data-modi'),
        parentModi = modi.substr(0, modi.lastIndexOf('.'));
    
    var newParam = {
        parent: parentId,
        parent_modi: parentModi,
        mm_id: app.data.tree.mm._id,
        modi: modi
    };
    
    var trigger = new utilsLib.Trigger($(this).closest('ul.treenode'), 'reload_node', [parentId]);
    
    $('#dialog-bloc').trigger('editDoc', [undefined, newParam, trigger]);
    
    return false;
}