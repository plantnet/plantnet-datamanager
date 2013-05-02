function() {
    var utilsLib = $$(this).app.libs.utils;
    
    $('#map-layer-modal').modal({ backdrop: 'static' });
    utilsLib.hideBusyMsg('newMapLayer');
}