function(e) {
    $(this).closest('.droppable').removeClass('accept-drop');

    var app = $$(this).app,
        that = this,
        treeViewLib = app.getlib('treeview'),
        utilsLib = app.getlib('utils'),
        src_id = app.data.dataTransfer.id,
        src_label = app.data.dataTransfer.label,
        src = app.data.dataTransfer.src,
        dst_id = $(this).attr('id'),
        dst_label = $('span.draggable', this).text().trim(),
        treeStructure = app.data.tree,
        currentParent = treeStructure.by_id[src_id].parent_id;

    if (currentParent != dst_id) {
        var answer = confirm('Move "' + src_label + '" to "' + dst_label  + '" ?');
        if (answer) {
            function onSuccess() {
                var srcParent = treeStructure.by_id[src_id].parent_id;
                treeViewLib.move(treeStructure, src_id, dst_id);
                $(that).trigger('reload_node', [dst_id, showSynonyms]);
                $(src).closest('ul.treenode').trigger('reload_node', [srcParent, showSynonyms]);
                return false;
            }

            function onError(e) {
                utilsLib.showError(e);
            }

            delete app.data.dataTransfer;

            app.db.openDoc(src_id, {
                success: function(doc) {
                    app.db.dm('datamanager/save_doc', { parent: dst_id }, doc, onSuccess, onError);
                }
            });
        }
    }
    return false;
}

