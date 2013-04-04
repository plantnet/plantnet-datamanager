function(mm, treeStructure, q, showSyn) {
    var app = $$(this).app,
        utilsLib = app.getlib('utils');

    app.data.mm = mm;
    app.data.tree = treeStructure;

    var modelEmpty = (utilsLib.objectEmpty(mm.structure));

    return { 
        mm_id: mm._id,
        mm_name: mm.name,
        isRef: mm.isref,
        modelEmpty: modelEmpty,
        showSyn : showSyn
    };
}