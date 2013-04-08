function(mm, mms) {
    var app = $$(this).app;

    app.data.mm = mm;
    app.data.orig_mm_json = JSON.stringify(mm); // deep copy
    app.data.mms = mms;

    // marker to warn user before quitting structure editor
    app.data.structureEditorOpen = true;

    return {mm: mm};
};