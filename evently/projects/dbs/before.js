function() {
    var app = $$(this).app;
    app.libs.utils.showBusyMsg('Loading databases', 'databases').initAppData(app);
}