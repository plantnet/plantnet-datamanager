function(id) {
    var app = $$(this).app,
        utilsLib = app.getlib('utils'),
        htmlLib = app.getlib('html');

    $('[data-spy="affix"]').affix();

    // reset last clicked checkbox
    app.lastClickedCheckbox = -1;
    app.lastClickedCheckboxState = false;

    utilsLib.hideBusyMsg('viewDoc');

    htmlLib.activateImgViewer('a.preview').indent();

    // go to doc anchor, or custom anchor if specified
    var anchorId = htmlLib.getAnchor(id);
    htmlLib.scrollTo('#' + anchorId, 70); // add offset for affix toolbar
}