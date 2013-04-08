function(e) {
    //var modi = e.originalEvent.dataTransfer.getData("Text");
    var app = $$(this).app,
        drag_modi = app.data.dataTransfer.modi,
        drop_modi = $(this).attr('data-modi'),
        drop_id = $(this).attr('id');

    // remove last element in source modi to compare to target modi
    var accept_drop = drag_modi.split('.');
    accept_drop.pop();
    accept_drop = accept_drop.join('.');

    // add optional rank
    var accept_drops = {};

    var mm = app.data.mm,
        opt = true,
        parent = accept_drop;

    while (mm.structure[parent] && opt) {
        accept_drops[parent] = true;
        opt = mm.structure[parent][2],
        parent = mm.structure[parent][1]; // parent
    }

    var src_id = $$(this).app.data.dataTransfer.id,
        ts = app.data.tree,
        currentParent = ts.by_id[src_id].parent_id;

    if ((drop_modi in accept_drops) && (currentParent != drop_id)) {
        $(this).closest('.droppable').addClass('accept-drop');
        
        e.preventDefault(); // necessary to accept drop
    }
}