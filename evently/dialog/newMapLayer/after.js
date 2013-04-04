function() {
    var utilsLib = $$(this).app.libs.utils;
    
    $('#map-layer-modal').modal('show');
    utilsLib.hideBusyMsg('newMapLayer');
}