function(mm, mms) {
    var app = $$(this).app;

    app.data.mm = mm;
    app.data.mms = mms;

    // marker to warn user before quitting structure editor
    app.data.structureEditorOpen = true;

    return {
        mm: mm,
        isref: mm.isref,
        readonly: mm.readonly
    };
};