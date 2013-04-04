function() {
    var app = $$(this).app,
        checked = ($(this).attr('checked') == 'checked') ? true : false,
        layerId = $(this).data('layer-id');
    
    $.log('checked:'+checked);
    
    if (checked){
        $(this).parent('label').addClass('active');
        var overlayMap = new google.maps.ImageMapType(app.overlayMaps[layerId]);
        app.data.map.overlayMapTypes.setAt(layerId, overlayMap);
    } else {
        $(this).parent('label').removeClass('active');
        if (app.data.map.overlayMapTypes.getLength() > 0){
            app.data.map.overlayMapTypes.setAt(layerId, null);
        }
    }
    
    // Don't return false or use event.stopPropagation() if you want see the checkbox checked
}