function() {
    var utilsLib = $$(this).app.getlib('utils');
    utilsLib.showBusyMsg('Loading missing references view...', 'missingRef');
    
    $('.model-toolbar .btn').removeClass('active');
    $('.model-toolbar .btn.view-links-break-cmd').addClass('active');
}