function(e) {
    var app = $$(this).app,
        href = $(this).attr('href');

    // disable warning for unsaved changes in structure
    app.data.structureEditorOpen = false;

    $.pathbinder.go(href);

    return false;
}