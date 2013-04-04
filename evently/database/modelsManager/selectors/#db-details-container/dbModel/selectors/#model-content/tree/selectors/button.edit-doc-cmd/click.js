function() {
    var app = $$(this).app,
        utilsLib = app.getlib('utils'),
        ck = $('ul.treenode input.ck:checked'),
        treeStructure = app.data.tree;

    if (ck.length != 1) {
        utilsLib.showWarning('Please select only one doc to edit.')
    } else {
        var id = ck.val();
        ck.removeAttr('checked');

        if (id) {
            var parent_id = treeStructure.by_id[id].parent_id,
                trigger = new utilsLib.Trigger($(this).closest('ul.treenode'), 'reload_node', [parent_id]);
            $('#dialog-bloc').trigger('editDoc', [id, null, trigger]);
        }
    }
    return false;
}