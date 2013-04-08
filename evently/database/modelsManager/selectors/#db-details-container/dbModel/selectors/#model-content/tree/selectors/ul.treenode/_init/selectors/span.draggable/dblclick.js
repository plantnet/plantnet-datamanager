function(e) {
    // Double click on the tree element to view details
    // Double click on the tree element while holding Ctrl to trigger edition
    var app = $$(this).app,
        treeStructure = app.data.tree,
        id = $(this).attr('id');

    if (e.ctrlKey) {
        var parent_id = treeStructure.by_id[id].parent_id,
            trigger = new utilsLib.Trigger($(this).closest('ul.treenode'), 'reload_node', [parent_id]);
        $('#dialog-bloc').trigger('editDoc', [id, null, trigger]);
    } else {
        $.pathbinder.go('/viewdoc/' + id);
    }
}