function() {
    var app = $$(this).app;
        utilsLib = app.getlib('utils'),
        htmlLib = app.getlib('html');
    
    utilsLib.hideBusyMsg('modelMenu');
    htmlLib.indent();
}