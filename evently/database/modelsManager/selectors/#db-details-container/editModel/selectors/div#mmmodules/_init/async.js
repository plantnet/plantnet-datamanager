function(callback, e, params) {

    var activateTab;
    if (params && params.activateTab) {
        activateTab = params.activateTab;
    } else {
        activateTab = false;
    }

    callback(activateTab);
}