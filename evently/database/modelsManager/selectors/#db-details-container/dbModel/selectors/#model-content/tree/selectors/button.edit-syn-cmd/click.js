function() {
    var app = $$(this).app,
        utilsLib = app.getlib('utils'),
        ck = $('ul.treenode input.ck:checked'),
        treeStructure = app.data.tree;

    if (ck.length < 1) {
        utilsLib.showWarning('Please select at least one doc to edit synonymy');
    } else if (ck.length == 1) { // regular synonyms editor 
        var id = ck.val();
        ck.attr('checked', false);
        if (id) {
            var parent_id = treeStructure.by_id[id].parent_id,
                trigger = new utilsLib.Trigger($(this).closest('ul.treenode'), 'reload_node', [parent_id]);
            $('#dialog-bloc').trigger('editSyn', [id, trigger]);
        }
    } else { // add multiple synonyms at once
        var ids = [];
        ck.each(function() {
            ids.push($(this).val());
            //$(this).attr('checked', false); // annoying in case of complex/large selection
        });
        if (ids.length) {
            var parent_id = treeStructure.by_id[ids[0]].parent_id,
                // @TODO adapt trigger to reload all modified nodes
                trigger = new utilsLib.Trigger($(this).closest('ul.treenode'), 'reload_node', [parent_id]);
            $('#dialog-bloc').trigger('editSyn', [ids, trigger]);
        }
    }

    return false;
}

