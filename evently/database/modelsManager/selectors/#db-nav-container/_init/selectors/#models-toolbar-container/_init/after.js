function(e) {
    // activate button corresponding to active view
    var activeView = $$(this).app.infos.model.activeView;

    if (activeView) {
        var buttonToActivate = $(this).find('a.toggle-' + activeView);
        if (buttonToActivate) {
            buttonToActivate.addClass('active');
        }
    }
}